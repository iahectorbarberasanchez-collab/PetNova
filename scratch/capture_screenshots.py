import os
import shutil
import time
from playwright.sync_api import sync_playwright

project_dir = r"C:\Users\ester\Desktop\HECTOR\PetNova"
screenshots_local = os.path.join(project_dir, "screenshots")
screenshots_portfolio = r"C:\Users\ester\Desktop\HECTOR\Hector Maestro IA\apps\portfolio\assets\screenshots\petnova"

os.makedirs(screenshots_local, exist_ok=True)
os.makedirs(screenshots_portfolio, exist_ok=True)

targets = [
    {"name": "landing", "url": "http://localhost:3010/"},
    {"name": "blog", "url": "http://localhost:3010/blog"},
    {"name": "dashboard", "url": "http://localhost:3010/dashboard"},
    {"name": "dashboard-health", "url": "http://localhost:3010/dashboard/health"},
    {"name": "dashboard-map", "url": "http://localhost:3010/dashboard/map"},
    {"name": "dashboard-shop", "url": "http://localhost:3010/dashboard/shop"},
]

def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        for t in targets:
            name = t["name"]
            url = t["url"]
            print(f"Processing target: {name} ({url})")
            
            # Desktop Capture (1440x900)
            context_desktop = browser.new_context(
                viewport={"width": 1440, "height": 900},
                device_scale_factor=2
            )
            page = context_desktop.new_page()
            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                time.sleep(2) # animations & styles settle
                
                filename_d = f"{name}-desktop.png"
                path_local_d = os.path.join(screenshots_local, filename_d)
                path_port_d = os.path.join(screenshots_portfolio, filename_d)
                
                page.screenshot(path=path_local_d, full_page=False)
                shutil.copyfile(path_local_d, path_port_d)
                print(f"  Captured Desktop -> {path_local_d}")
            except Exception as e:
                print(f"  Error on Desktop {name}: {e}")
            finally:
                context_desktop.close()
                
            # Mobile Capture (375x812)
            context_mobile = browser.new_context(
                viewport={"width": 375, "height": 812},
                device_scale_factor=2,
                is_mobile=True,
                has_touch=True
            )
            page_m = context_mobile.new_page()
            try:
                page_m.goto(url, wait_until="networkidle", timeout=30000)
                time.sleep(2)
                
                filename_m = f"{name}-mobile.png"
                path_local_m = os.path.join(screenshots_local, filename_m)
                path_port_m = os.path.join(screenshots_portfolio, filename_m)
                
                page_m.screenshot(path=path_local_m, full_page=False)
                shutil.copyfile(path_local_m, path_port_m)
                print(f"  Captured Mobile -> {path_local_m}")
            except Exception as e:
                print(f"  Error on Mobile {name}: {e}")
            finally:
                context_mobile.close()
                
        browser.close()
        print("Screenshot capture completed!")

if __name__ == "__main__":
    capture()
