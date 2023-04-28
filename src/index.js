const url = "https://scholar.google.com/citations?hl=vi&view_op=search_authors&mauthors=vnu.edu.vn&btnG=&fbclid=IwAR2kneOVtMSok7OSh5kqrvH5wwKejNYp_ZpJBiWMUUc2vIXzpWy1kuvaEcY";

const puppeteer = require("puppeteer");

const XLSX = require('xlsx');

(async () => {
    const browser = await puppeteer.launch({
        // headless: false
        headless: "new"
    });
    let count = 1000;

    const page = await browser.newPage();
    await page.goto(url);

    
    const profiles = [];

    while(true){
        const profilesElements = await page.$$('.gsc_1usr');
        for (let profileEl of profilesElements) {
            const nameEl =  await profileEl.$('.gs_ai_name');
            const descriptionEl =  await profileEl.$('.gs_ai_aff');
            const emailEl =  await profileEl.$('.gs_ai_eml');
            const countEl =  await profileEl.$('.gs_ai_cby');
            const majorEl =  await profileEl.$('.gs_ai_int');
            const linkEl =  await profileEl.$('.gs_ai_name a');
    
            const name = await nameEl.evaluate(el => el.textContent);
            const description = await descriptionEl.evaluate(el => el.textContent);
            const email = await emailEl.evaluate(el => el.textContent);
            const count = (await countEl.evaluate(el => el.textContent))?.replace('Trích dẫn ', '')?.replace(' bài viết', '') || '';
            const major = await majorEl.evaluate(el => el.textContent);
            const link = 'https://scholar.google.com' + (await linkEl?.evaluate(el => el.getAttribute('href')) || '');
            const profile = {
                name,
                description,
                email,
                count,
                major,
                link
            }
    
            profiles.push(profile);
        }
    
        const nextBtn = await page.$('#gsc_authors_bottom_pag > div > button.gs_btnPR.gs_in_ib.gs_btn_half.gs_btn_lsb.gs_btn_srt.gsc_pgn_pnx');
        const is_disabled = await page.$('#gsc_authors_bottom_pag > div > button.gs_btnPR.gs_in_ib.gs_btn_half.gs_btn_lsb.gs_btn_srt.gsc_pgn_pnx[disabled]') !== null;
    
        if (is_disabled || count === 0) {
            break;
        }
        count--;
        await nextBtn.click();
        await page.waitForNavigation();
        
    console.log(profiles.length);
    }


    await browser.close();
    // console.log(profiles);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
        profiles.map(pro => {
            return {
                "Tên":pro.name,
                "Mô tả":pro.description,
                "Email":pro.email,
                "Trích dẫn":pro.count,
                "Profiles":pro.major,
                link: pro.link
            }
        })
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a file
    XLSX.writeFile(workbook, 'example.xlsx');
    })();