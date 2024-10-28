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
 * 缓存列的数组，用于判断列的值是否相同
 * @type { Array<Array<CacheItem>> }
 */
const cacheRowArray = [];

/** @type { [number, number, number, number, 1 | 0] | null } - 记录[x坐标，y坐标，行，列，是否可编辑] */
let checkState = null;

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
  for (const item of cacheColArray[checkState[2]]) {
    if (value === item.value && !(item.coordinate[0] === checkState[0] && item.coordinate[1] === checkState[1])) {
      return item.coordinate;
    }
  }

  return null;
}

/**
 * 检查列的值是否有重复，并返回坐标
 * @param { number } value - 检查的值
 * @return { Array<[number, number]> | null }
 */
function checkRow(value) {
  for (const item of cacheRowArray[checkState[3]]) {
    if (value === item.value && !(item.coordinate[0] === checkState[0] && item.coordinate[1] === checkState[1])) {
      return item.coordinate;
    }
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

/* 检查行是否完全填写正确，并添加动画 */
function addColFillingCompletedAnimation() {
  if (cacheColArray[checkState[2]].length !== 4) return;

  let i = 1;

  while (true) {
    const [m, n] = [
      document.querySelector(`[data-col="${ checkState[2] }"][data-row="${ checkState[3] - i }"]`),
      document.querySelector(`[data-col="${ checkState[2] }"][data-row="${ checkState[3] + i }"]`)
    ];

    if (!(m || n)) break;

    if (m && !m.classList.contains('palace-filling-completed')) {
      m.classList.add('palace-filling-completed');
      m.addEventListener('animationend',
        () => m.classList.remove('palace-filling-completed'), { once: true });
    }

    if (n && !n.classList.contains('palace-filling-completed')) {
      n.classList.add('palace-filling-completed');
      n.addEventListener('animationend',
        () => n.classList.remove('palace-filling-completed'), { once: true });
    }

    i++;
  }
}

/* 检查列是否完全填写正确，并添加动画 */
function addRowFillingCompletedAnimation() {
  if (cacheRowArray[checkState[3]].length !== 4) return;

  let i = 1;

  while (true) {
    const [m, n] = [
      document.querySelector(`[data-col="${ checkState[2] - i }"][data-row="${ checkState[3] }"]`),
      document.querySelector(`[data-col="${ checkState[2] + i }"][data-row="${ checkState[3] }"]`)
    ];

    if (!(m || n)) break;

    if (m && !m.classList.contains('palace-filling-completed')) {
      m.classList.add('palace-filling-completed');
      m.addEventListener('animationend',
        () => m.classList.remove('palace-filling-completed'), { once: true });
    }

    if (n && !n.classList.contains('palace-filling-completed')) {
      n.classList.add('palace-filling-completed');
      n.addEventListener('animationend',
        () => n.classList.remove('palace-filling-completed'), { once: true });
    }

    i++;
  }
}

/* 检查组是否完全填写正确，并添加动画 */
function addGroupFillingCompletedAnimation() {
  if (palaceInitialState[checkState[0]].some((o) => o === null)) return;

  for (let j = 0; j < palaceInitialState[checkState[0]].length; j++) {
    if (checkState[1] === j) continue;

    const e = document.querySelector(`[data-x-index="${ checkState[0] }"][data-y-index="${ j }"]`);

    if (!e.classList.contains('palace-filling-completed')) {
      e.classList.add('palace-filling-completed');
      e.addEventListener('animationend',
        () => e.classList.remove('palace-filling-completed'), { once: true });
    }
  }
}

/* 删除旧的状态 */
function removeOldInput() {
  palaceInitialState[checkState[0]][checkState[1]] = null;

  for (const item of cacheColArray[checkState[2]]) {
    if (item.coordinate[0] === checkState[0] && item.coordinate[1] === checkState[1] ) {
      cacheColArray[checkState[2]].splice(cacheColArray[checkState[2]].indexOf(item), 1);
      break;
    }
  }

  for (const item of cacheRowArray[checkState[3]]) {
    if (item.coordinate[0] === checkState[0] && item.coordinate[1] === checkState[1] ) {
      cacheRowArray[checkState[3]].splice(cacheRowArray[checkState[3]].indexOf(item), 1);
      break;
    }
  }
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
  checkState = [
    Number(event.target.dataset.xIndex),
    Number(event.target.dataset.yIndex),
    Number(event.target.dataset.col),
    Number(event.target.dataset.row),
    Number(event.target.dataset.canEdit),
  ];

  // 清除旧选中样式
  document.querySelectorAll('.palace-ckecked-bg')
    .forEach((e) => e.classList.remove('palace-ckecked-bg'));
  document.querySelector('.palace-ckecked-item-bg')?.classList.remove('palace-ckecked-item-bg');

  // 添加新选中样式
  document.querySelector(`[data-group-index="${ checkState[0] }"]`).classList.add('palace-ckecked-bg');
  document.querySelectorAll(`[data-col="${ checkState[2] }"]`)
    .forEach((e) => e.classList.add('palace-ckecked-bg'));
  document.querySelectorAll(`[data-row="${ checkState[3] }"]`)
    .forEach((e) => e.classList.add('palace-ckecked-bg'));
  event.target.classList.add('palace-ckecked-item-bg');
}

/* 选中后点击按钮事件 */
function handleInputNumberClick(event) {
  if (checkState === null) return;

  const hasValue = palaceInitialState[checkState[0]][checkState[1]] !== null;

  if (hasValue && !checkState[4]) return;

  const inputNumber = Number(event.target.dataset.input);
  const checkGroupResult = checkGroup(palaceInitialState[checkState[0]], inputNumber); // 检查宫是否有重复 {checkState[0],r}
  const checkColResult = checkCol(inputNumber); // 检查行是否有重复
  const checkRowResult = checkRow(inputNumber); // 检查列是否有重复

  const e = document.querySelector(`[data-x-index="${ checkState[0] }"][data-y-index="${ checkState[1] }"]`);

  // 没有重复
  if (checkGroupResult === null && checkColResult === null && checkRowResult === null) {
    removeOldInput();
    e.innerText = inputNumber;
    palaceInitialState[checkState[0]][checkState[1]] = inputNumber;

    const o = {
      value: inputNumber,
      coordinate: [checkState[0], checkState[1]]
    };

    cacheColArray[checkState[2]].push(o);
    cacheRowArray[checkState[3]].push(o);

    addColFillingCompletedAnimation();
    addRowFillingCompletedAnimation();
    addGroupFillingCompletedAnimation();
    checkAllInput();

    return;
  }

  // 在没有值时添加错误动画
  if (!hasValue) {
    e.innerText = inputNumber;

    if (checkGroupResult !== null) addErrorAnimation(checkState[0], checkGroupResult);

    if (checkColResult !== null) addErrorAnimation(...checkColResult);

    if (checkRowResult !== null) addErrorAnimation(...checkRowResult);

    e.addEventListener('animationend', handleCheckHasErrorAnimationEnd, { once: true });
    e.classList.add('palace-item-checked-error');
  }
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
      const canNotEdit = !!palaceInitialState[i][j];

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
        <div class="palace-item ${ canNotEdit ? '' :  'palace-item-input' }"
          data-x-index="${ i }"
          data-y-index="${ j }"
          data-col="${ col }"
          data-row="${ row }"
          data-can-edit="${ canNotEdit ? '0' : '1' }"
        >
          ${ palaceInitialState[i][j] ?? '' }
        </div>
      `);
    }

    htmlArray.push(`<div class="palace-group" data-group-index="${ i }">${ groupHtml.join('') }</div>`);
  }

  document.getElementById('palace-main').innerHTML = htmlArray.join('');

  // 添加点击事件
  document.querySelectorAll('.palace-item')
    .forEach((e) => e.addEventListener('click', handlePalaceItemClick));

  // 按钮添加点击事件
  document.getElementById('input-number-1').addEventListener('click', handleInputNumberClick);
  document.getElementById('input-number-2').addEventListener('click', handleInputNumberClick);
  document.getElementById('input-number-3').addEventListener('click', handleInputNumberClick);
  document.getElementById('input-number-4').addEventListener('click', handleInputNumberClick);
}

init();