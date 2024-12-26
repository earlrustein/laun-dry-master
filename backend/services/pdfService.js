const puppeteer = require('puppeteer');
const { generateHTMLContent } = require('./../templates/generated-html');

const generatePDF = async (data) => {
  const { salesData, totalGrossSales, expensesData, totalExpensesData, dateRange } = data;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(generateHTMLContent({ salesData, totalGrossSales, expensesData, totalExpensesData, dateRange }));
  await page.addStyleTag({ content: 'body { margin: 0px; }' });

  const pdfBuffer = await page.pdf({
    printBackground: true,
    format: 'Letter',
  });

  await browser.close();
  return pdfBuffer;
};

module.exports = { generatePDF };
