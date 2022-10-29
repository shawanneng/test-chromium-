// 引入readline模块
const readline = require('readline');
//控制台输出
const log = console.log;

// 创建readline接口实例
let r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

init();

function init() {
  const platform = process.platform;
  log(`您当前使用的系统为${platform} 可多开`);
  log(`温馨提示: 同时按键Ctrl + C 退出重头再来 `);
  log(`
   输入1切换采集线程
   输入2切换数据处理线程
  `);
  createQuestion();
}

function createQuestion() {
  r1.question('请输入线程ID:\t', (chunk) => {
    const id = chunk.toString() - 0;
    let isYes = [1, 2].includes(id);
    if (!isYes) {
      log('输入错误,请正确输入线程Id!');
      createQuestion();
    } else {
      if (id === 1) {
        //采集
        createCollection();
      } else {
        //操作数据
        createOperationData();
      }
    }
  });
}

//采集操作
function createCollection() {
  r1.question(
    '请输入抖音直播间链接:格式为:https://*.douyin.com/*** :',
    (url) => {
      let urlReg = new RegExp(/https:\/\/\w+.douyin.com\//g);
      let result = urlReg.test(url);
      if (result) {
        log('采集程序开始就位,请注意桌面的json文件输出! ');
        // init({ url });
        r1.close();
      } else {
        log('您输入的url格式不正正确,请重新输入!');
        createCollection();
      }
    }
  );
}

//操作数据
function createOperationData() {
  r1.question('请输入评论内容关键字进行筛选', (text) => {
    const screenContent = text.trim();

    let result = urlReg.test(url);
    if (result) {
      log('采集程序开始就位,请注意桌面的json文件输出! ');
      // init({ url });
      r1.close();
    } else {
      log('您输入的url格式不正正确,请重新输入!');
      createCollection();
    }
  });
}

//读取文件
function createReadFileData() {
  r1.question('请输入软件运行同目录下的json文件名(xxxx.json):', (file) => {
    const fileName = file.trim();

    readFile({ fileName });
  });
}

function readFile({ fileName }) {
  const dirname = `${process.cwd()}`;

  let data = '[]';
  try {
    data = fs.readFileSync(`${dirname}/${fileName}.json`, 'utf8') || '[]';
    return data;
  } catch (error) {
    console.log('找不到指定文件');
    r1.close();
  }
}
