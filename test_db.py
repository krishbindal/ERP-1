import asyncio
import os
import json

from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(storage_state='playwright/.auth/branchadmin.json')
        page = await context.new_page()
        
        await page.goto('http://127.0.1:3000/scheduling/timetable')
        await page.wait_for_timeout(2000)
        
        # we will execute a fetch directly in the browser to see the response
        res = await page.evaluate('''async () => {
            const req = await fetch('http://127.0.1:3000/api/test', {method: 'GET'});
            return req.text();
        }''')
        
        print("Done")
        await browser.close()

asyncio.run(main())
