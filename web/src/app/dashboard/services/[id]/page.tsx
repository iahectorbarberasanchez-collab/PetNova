import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProviderDetailClient from './ProviderDetailClient'
import { JsonLd } from '@/components/JsonLd'

interface ProviderDetail {
    id: string
    headline: string
    bio: string
    location_city: string
    phone: string | null
    is_verified: boolean
    rating: number
    review_count: number
    profiles: { id: string; full_name: string; avatar_url: string | null } | null
    services: { id: string; service_type: string; price_amount: number; price_unit: string; description: string | null }[]
}

interface Props {
    params: Promise<{ id: string }>
}

async function getProvider(id: string): Promise<ProviderDetail | null> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('service_providers')
        .select('*, profiles:user_id(id, full_name, avatar_url), services(id, service_type, price_amount, price_unit, description)')
        .eq('id', id)
        .single()
    return data as unknown as ProviderDetail | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const provider = await getProvider(id)

    if (!provider) return { title: 'Profesional no encontrado | PetNexa' }

    const name = provider.profiles?.full_name || 'Profesional'
    const serviceTypes = provider.services.map((s) => s.service_type)
    
    return {
        title: `${name} | ${provider.headline} | PetNexa`,
        description: provider.bio.slice(0, 160),
        keywords: [name, provider.location_city, ...serviceTypes, 'cuidado de mascotas', 'PetNexa'],
    }
}

export default async function ProviderDetailPage({ params }: Props) {
    const { id } = await params
    const provider = await getProvider(id)

    if (!provider) notFound()

    const name = provider.profiles?.full_name || 'Profesional PetNexa'
    
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': name,
        'description': provider.bio,
        'image': provider.profiles?.avatar_url || '',
        'address': {
            '@type': 'PostalAddress',
            'addressLocality': provider.location_city,
            'addressCountry': 'ES'
        },
        'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': provider.rating,
            'reviewCount': provider.review_count
        }
    }

    return (
        <>
            <JsonLd data={jsonLd} />
            <ProviderDetailClient initialProvider={provider} />
        </>
    )
}
