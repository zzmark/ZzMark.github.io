
const fs = require('fs')
const path = require('path')

const baseDir = path.resolve('./public')

const domain = 'https://www.zzmark.top'

// 只打印需要CDN 预热的
const isCDNWarmup = false

// 调用文件遍历方法
fileDisplay(baseDir)

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath) {
  // 根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.warn(err)
    } else {
      // 遍历读取到的文件列表
      files.forEach(function (filename) {
        // 获取当前文件的绝对路径
        const filedir = path.join(filePath, filename)
        fs.stat(filedir, function (eror, stats) {
          if (eror) {
            console.warn('获取文件stats失败')
          } else {
            if (stats.isFile()) {
              // 打印文件名
              if(isCDNWarmup && stats.size < 100000) {
                return
              }
              let fullFilePath = filedir + ''
              if(filename === 'index.html') {
                fullFilePath = fullFilePath.replace('index.html', '')
              }
              console.log(domain + fullFilePath.substr(baseDir.length).split("\\").join("/"))
            }
            if (stats.isDirectory()) {
              fileDisplay(filedir)//递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        })
      })
    }
  })
}