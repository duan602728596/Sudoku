/**
 * 定义数独的初始化数组
 * @type { Array<Array<number | null>> }
 */
const palaceInitialState = [
  [1, 2, 4, 3],
  [null, null, 1, 2],
  [null, 4, 3, null],
  [3, null, null, null]
];

/**
 * 缓存行和列的数组
 * @typedef {{
 *   value: number;
 *   coordinate: [number, number];
 * }} CacheItem
 */

/**
 * 缓存行的数组，用于判断行的值是否相同
 * @type { Array<Array<CacheItem>> }
 */
const cacheColArray = [];

/**
 * 缓存行的数组，用于判断行的值是否相同
 * @type { Array<Array<CacheItem>> }
 */
const cacheRowArray = [];

/** @type { [number, number, number, number] | null } - 记录[x坐标，y坐标，行，列] */
let check = null;

/* =============== 算法 =============== */
/**
 * 检查宫的值是否有重复，并返回坐标
 * @param { Array<number> } arr - 当前的宫
 * @param { number } value - 检查的值
 * @return { number | null } - 结果
 */
function checkGroup(arr, value) {
  const index = arr.indexOf(value);

  return index >= 0 ? index : null;
}

/**
 * 检查行的值是否有重复，并返回坐标
 * @param { number } value - 检查的值
 * @return { Array<[number, number]> | null }
 */
function checkCol(value) {
  for (const item of cacheColArray[check[2]]) {
    if (value === item.value) return item.coordinate;
  }

  return null;
}

/**
 * 检查列的值是否有重复，并返回坐标
 * @param { number } value - 检查的值
 * @return { Array<[number, number]> | null }
 */
function checkRow(value) {
  for (const item of cacheRowArray[check[3]]) {
    if (value === item.value) return item.coordinate;
  }

  return null;
}

/* 检查全部填完 */
function checkAllInput() {
  if (!palaceInitialState.some((group) => group.includes(null))) {
    document.getElementById('win').classList.remove('win-none');
    document.getElementById('win-audio').play();
  }
}

/* =============== 其他方法 =============== */
/**
 * 添加其他item的错误动画
 * @param { number } x
 * @param { number } y
 */
function addErrorAnimation(x, y) {
  const e = document.querySelector(`[data-x-index="${ x }"][data-y-index="${ y }"]`);

  if (!e.classList.contains('palace-item-error')) e.classList.add('palace-item-error');
}

/* =============== 事件监听 =============== */
/* 错误动画的结束事件 */
function handleCheckHasErrorAnimationEnd(event) {
  event.target.classList.remove('palace-item-checked-error');
  event.target.innerText = '';
  event.target.removeEventListener('animationend', handleCheckHasErrorAnimationEnd);
  document.querySelectorAll('.palace-item-error')
    .forEach((e) => e.classList.remove('palace-item-error'));
}

/* item添加点击事件 */
function handlePalaceItemClick(event) {
  // 记录坐标点
  check = [
    Number(event.target.dataset.xIndex),
    Number(event.target.dataset.yIndex),
    Number(event.target.dataset.col),
    Number(event.target.dataset.row),
  ];

  // 清除旧选中样式
  document.querySelectorAll('.palace-ckecked-bg')
    .forEach((e) => e.classList.remove('palace-ckecked-bg'));
  document.querySelector('.palace-ckecked-item-bg')?.classList.remove('palace-ckecked-item-bg');

  // 添加新选中样式
  document.querySelector(`[data-group-index="${ check[0] }"]`).classList.add('palace-ckecked-bg');
  document.querySelectorAll(`[data-col="${ check[2] }"]`)
    .forEach((e) => e.classList.add('palace-ckecked-bg'));
  document.querySelectorAll(`[data-row="${ check[3] }"]`)
    .forEach((e) => e.classList.add('palace-ckecked-bg'));
  event.target.classList.add('palace-ckecked-item-bg');
}

/* 选中后点击按钮事件 */
function handleInputNumberClick(event) {
  if (check === null) return;

  if (palaceInitialState[check[0]][check[1]] !== null) return;

  const inputNumber = Number(event.target.dataset.input);
  const checkGroupResult = checkGroup(palaceInitialState[check[0]], inputNumber); // 检查宫是否有重复 {check[0],r}
  const checkColResult = checkCol(inputNumber); // 检查行是否有重复
  const checkRowResult = checkRow(inputNumber); // 检查列是否有重复

  const e = document.querySelector(`[data-x-index="${ check[0] }"][data-y-index="${ check[1] }"]`);

  e.innerText = inputNumber;
  e.classList.add('palace-item-input');

  // 没有重复
  if (checkGroupResult === null && checkColResult === null && checkRowResult === null) {
    palaceInitialState[check[0]][check[1]] = inputNumber;

    const o = {
      value: inputNumber,
      coordinate: [check[0], check[1]]
    };

    cacheColArray[check[2]].push(o);
    cacheRowArray[check[3]].push(o);

    checkAllInput();
    return;
  }

  // 添加错误动画
  if (checkGroupResult !== null) addErrorAnimation(check[0], checkGroupResult);

  if (checkColResult !== null) addErrorAnimation(...checkColResult);

  if (checkRowResult !== null) addErrorAnimation(...checkRowResult);

  e.addEventListener('animationend', handleCheckHasErrorAnimationEnd, { once: true });
  e.classList.add('palace-item-checked-error');
}

/* 初始化 */
function init() {
  // 初始化dom
  const htmlArray = [];

  for (let i = 0; i < palaceInitialState.length; i++) {
    const groupHtml = [];
    const groupColIndex = Math.floor(i / 2);
    const groupRowIndex = i % 2;

    for (let j = 0; j < palaceInitialState[i].length; j++) {
      const colIndex = Math.floor(j / 2);
      const rowIndex = j % 2;
      const [col, row] = [(groupColIndex * 2) + colIndex, (groupRowIndex * 2) + rowIndex];

      if (palaceInitialState[i][j]) {
        cacheColArray[col] ??= [];
        cacheRowArray[row] ??= [];

        const o = {
          value: palaceInitialState[i][j],
          coordinate: [i, j]
        };

        cacheColArray[col].push(o);
        cacheRowArray[row].push(o);
      }

      groupHtml.push(`
        <div class="palace-item handle-palace-item"
          data-x-index="${ i }"
          data-y-index="${ j }"
          data-col="${ col }"
          data-row="${ row }"
        >
          ${ palaceInitialState[i][j] ?? '' }
        </div>
      `);
    }

    htmlArray.push(`<div class="palace-group" data-group-index="${ i }">${ groupHtml.join('') }</div>`);
  }

  document.getElementById('palace-main').innerHTML = htmlArray.join('');

  // 添加点击事件
  document.querySelectorAll('.handle-palace-item')
    .forEach((e) => e.addEventListener('click', handlePalaceItemClick));

  // 按钮添加点击事件
  document.getElementById('input-number-1').addEventListener('click', handleInputNumberClick);
  document.getElementById('input-number-2').addEventListener('click', handleInputNumberClick);
  document.getElementById('input-number-3').addEventListener('click', handleInputNumberClick);
  document.getElementById('input-number-4').addEventListener('click', handleInputNumberClick);
}

init();