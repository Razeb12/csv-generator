const fs = require('fs')
const XLSX = require('xlsx')

const directoryPath = './' // Replace with your directory path
const csvFileName = 'result.csv' // Replace with your desired CSV file name

const files = fs.readdirSync(directoryPath)

const xlsFiles = files.filter(
  (file) => file.endsWith('.xls') || file.endsWith('.xlsx') || file.endsWith('.XLS')
)
const csvFiles = files.filter((file) => file.endsWith('.csv'))

let csvData = 'File Index, File Name'
let tabCounts = []

xlsFiles.forEach((file, index) => {
  const workbook = XLSX.readFile(`${directoryPath}/${file}`)
  const sheetNames = workbook.SheetNames
  const tabCount = sheetNames.length
  tabCounts.push(tabCount)
})

const maxTabCount = Math.max(...tabCounts)

for (let i = 1; i <= maxTabCount; i++) {
  csvData += `, Tab Name ${i}`
}

csvData += '\n'

xlsFiles.forEach((file, index) => {
  const workbook = XLSX.readFile(`${directoryPath}/${file}`)
  const sheetNames = workbook.SheetNames
  const tabNames = sheetNames.slice(0, maxTabCount).join(', ')
  const row = `File ${index + 1}, ${file}, ${tabNames}\n`
  csvData += row
})

csvFiles.forEach((file, index) => {
  const row = `File ${xlsFiles.length + index + 1}, ${file},\n`
  csvData += row
})

fs.writeFileSync(csvFileName, csvData, { encoding: 'utf8' })

console.log(`CSV file "${csvFileName}" created successfully.`)
