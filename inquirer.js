import inquirer from 'inquirer';
init();
async function init() {
  const threadId = await createQuestion({
    type: 'list',
    message: '请选择线程ID:',
    choices: [
      { value: 1, name: '采集' },
      { value: 2, name: '操作数据' },
    ],
  });

  if (threadId === 1) {
    await createCollection();
  } else {
    await createOperationData();
  }
}

function createQuestion(args) {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          ...args,
          name: 'name',
        },
      ])
      .then((answers) => {
        resolve(answers.name);
      });
  });
}

//采集操作
async function createCollection() {
  const url = await createQuestion({
    type: 'input',
    message: '请输入抖音直播间链接:格式为:https://*.douyin.com/*** :',
    validate: function (v) {
      return new RegExp(/https:\/\/\w+.douyin.com\//)?.test(v);
    },
  });
  await init({ url });
}

//找到要处理的数据源
async function createOperationData() {
  const fileName = await createQuestion({
    type: 'input',
    message: '请输入软件运行同目录下需要处理的json文件名(xxxx.json):',
    validate: function (v) {
      return new RegExp(/\d+\.json/)?.test(v);
    },
  });

  const originData = readFile({ fileName });
  await handleData({ originData });
}

//处理数据
async function handleData({ originData }) {
  const text = await createQuestion({
    type: 'input',
    message: '请输入要匹配筛选的关键字(模糊匹配(包含)):',
    validate: (v) => !!v,
  });
  const content = text.trim();
  //模糊筛选出 指定数据源
  const data = originData.filter((n) => n?.content?.indexOf(content) !== -1);
  console.log('data  ----->  ', data);
}

//读取数据
function readFile({ fileName }) {
  const dirname = `${process.cwd()}`;
  try {
    let data = fs.readFileSync(`${dirname}/${fileName}.json`, 'utf8') || '[]';
    return JSON.parse(data);
  } catch (error) {
    console.log('找不到指定文件');
    process.exit();
  }
}
