const fs = require('fs')
const path = require('path')

const baseDir = path.resolve('./')

const content = 
`deploy:
  - type: git
    repo: https://github.com/ZzMark/ZzMark.github.io
    branch: gh-pages
    ignore_hidden: false
  - type: cos-cdn
    cloud: tencent
    bucket: ${bucket}
    region: ${region}
    cdnEnable: true
    deleteExtraFiles: true
    updatePosts: true
    secretId: ${secretId}
    secretKey: ${secretKey}
all_minifier: true
`

fs.writeFile(`${baseDir}/_deploy.yml`, content, err => {
  if (err) {
    console.error(err)
    return
  }
  //文件写入成功。
})
