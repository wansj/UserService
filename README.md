# UserService（用户微服务）
# 安装
git clone https://github.com/wansj/UserService.git

cd /path/to/UserService

npm install
# 依赖
项目使用了[ursa](https://github.com/JoshKaufman/ursa)来生成公钥和密钥,在windows平台上，需要安装一些依赖：
[openssl](http://slproweb.com/products/Win32OpenSSL.html)(nomal版，非light版)，版本要求1.0.2（最新版1.1.0有bug）,64/32位的选择必须和node.js一样

[node-gyp](https://github.com/nodejs/node-gyp),安装请参考https://github.com/nodejs/node-gyp
安装速度可能有点慢（如果你选择使用windows-build-tools方式安装的话）
# 启动
npm run dev

# 说明
直接修改src/下面的文件不会起效，因为micro-dev使用的是dist/目录下面编译后文件，所以最好在webstorm中配置一个babel File Wather，这样当src/下面的源文件改动后会自动编译到dist目录下面。因为在项目源码中大量使用了es6语法，所以编译是必须的。
