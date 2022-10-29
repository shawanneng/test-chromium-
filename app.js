// pkg -t win app.js --public
const puppeteer = require('puppeteer-core');
const findChrome = require('./node_modules/carlo/lib/find_chrome');
// const portfinder = require('portfinder');
const express = require('express');
const app = express();
const cors = require('cors');
const { chromium } = require('playwright');
// let default_port = 6699;

// (async () => {
//   const port = await portfinder.getPortPromise({
//     port: default_port,
//   });

//   app.listen(port);
// })();

app.use(express.urlencoded());
app.use(express.json());

app.use((req, res, next) => {
  //解决跨域
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

app.use(cors({ credentials: true }));
let router = express.Router();

router.get('/one', async (req, res) => {
  const result = await puppeteerPlay(req.query);
  res.send(result);
});

router.get('/two', async (req, res) => {
  const result = await play(req.query);
  res.send(result);
});

app.use('/', router);

//以下是爬取区
async function puppeteerPlay({ url }) {
  let findChromePath = await findChrome({});
  let executablePath = findChromePath.executablePath;
  const browser = await puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '-wait-for-browser',
      '--use-gl=egl',
      '--no-zygote',
      '--disable-web-security',
      '--user-agent= Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
    ],
    executablePath,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url);
  await sleep(1500);
  console.log('执行puppeteer:');
  //注入脚本
  await page.evaluate(async () => {
    let time = Date.now();
    async function getFans() {
      let batchList = [];
      let dom = document.querySelector('.webcast-chatroom___items');
      let flag = 0;
      //配置项
      let options = {
        childList: true, //nodeList变化
        arrtibutes: true, //dom身上属性发生变化
        subtree: true, //dom减少变化
      };

      let callback = function (records) {
        records.forEach((i) => {
          if (i?.addedNodes?.length) {
            const [target] = i?.addedNodes;
            Object.entries(target).forEach(([key, value]) => {
              if (value?.children) {
                recursionFindSecUid(value);
              }
            });
          }
        });
      };

      let watchDom = new MutationObserver(callback);

      watchDom.observe(dom, options);

      async function recursionFindSecUid(child) {
        let children = child?.children;
        if (Object.prototype.toString.call(children) == '[object Object]') {
          let message = children?.props?.message;
          let childSon = children?.props?.children;
          if (Object.prototype.toString.call(message) == '[object Object]') {
            let nickname = message?.payload?.user?.nickname;
            let secUid = message?.payload?.user?.secUid;
            let douyinId = message?.payload?.user?.displayId;
            let content = message?.payload?.content;
            if (!nickname) {
              return;
            }

            function xhr({ batchList, id }) {
              let xhr = new XMLHttpRequest();
              xhr.open('post', 'http://127.0.0.1:6699/sendBot');
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.send(
                JSON.stringify({
                  batchList,
                  id,
                })
              );
            }

            const tip = `爬取到第${flag}个粉丝-网名:${nickname} 抖音号:${douyinId}`;
            console.log(tip);
            let data = {
              url: `https://www.douyin.com/user/${secUid}`,
              nickname,
              douyinId,
            };
            if (content) {
              data.content = content;
            }
            batchList.push(data);
            flag += 1;
            if (flag === 10) {
              console.log('time  ----->  ', time);
              await xhr({ batchList, id: time });
              batchList = [];
              flag = 0;
            }
          } else {
            if (Object.prototype.toString.call(childSon) == '[object Object]') {
              recursionFindSecUid(children.props);
            }
          }
        }
      }
    }

    await getFans();
  });

  return { code: 1, message: 'success' };
}

//以下是playwright
async function play() {
  const browser = await chromium.launch(); //模拟打开浏览器,设置有头模式，并通过slowMo属性减慢浏览器的每一步操作
  const context = await browser.newContext(); //建立context
  const page = await context.newPage(); //模拟打开一个浏览器的标签页
  await page.goto('https://www.baidu.com/'); //模拟访问网站url
  await page.screenshot({ path: `example.png` }); //对网页进行截图并保存为example.png
  await page.close(); //关闭网页
  await context.close(); //关闭context
  await browser.close(); //关闭浏览器
  console.log('执行chromium:');
  return { code: 1, message: 'success' };
}

async function sleep(t) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), t);
  });
}

module.exports = app;
