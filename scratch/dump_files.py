import os
import json

files = [
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\skills\market-launch\SKILL.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\skills\market-proposal\SKILL.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\skills\market-report-pdf\SKILL.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\skills\market-report\SKILL.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\skills\market-seo\SKILL.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\skills\market-social\SKILL.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\templates\content-calendar.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\templates\email-launch.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\templates\email-nurture.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\templates\email-welcome.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\templates\launch-checklist.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\ai-marketing-claude\templates\proposal-template.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\marketing\prompts_content_factory.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\qa-loop\QA_PROMPT.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\qa-loop\QA_SPEC.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\qa-loop\README.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\qa-loop\state\PROGRESS.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\qa-loop\state\QA_REPORT.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\web\ARCHITECTURE.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\web\CONTRIBUTING.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\web\README.md",
    r"C:\Users\ester\Desktop\HECTOR\PetNova\web\errors-only.txt",
]

for f in files:
    print(f"=== FILE: {f} ===")
    if not os.path.exists(f):
        print("DOES NOT EXIST")
        continue
    try:
        with open(f, "r", encoding="utf-8") as file:
            print(file.read())
    except Exception as e:
        print(f"ERROR: {e}")
    print("\n" + "="*40 + "\n")
