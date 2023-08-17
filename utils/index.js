// 快速排序
export function quickSort(tempArr) {
  //递归终止条件
  if (tempArr.length <= 1) {
    return tempArr;
  }
  //取基准
  var pivotIndex = Math.floor(tempArr.length / 2);
  var pivot = tempArr.splice(pivotIndex, 1);
  //分左右
  var leftArr = [];
  var rightArr = [];
  for (var i = 0; i < tempArr.length; i++) {
    if (tempArr[i] > pivot) {
      rightArr.push(tempArr[i]);
    } else {
      leftArr.push(tempArr[i]);
    }
  }
  return quickSort(leftArr).concat(pivot, quickSort(rightArr));
}

// 返回一个范围的随机整数
export function getRandomInt(min, max) {
  const minNum = parseInt(min) || 0;
  const maxNum = parseInt(max) || 1023;
  return Math.floor(Math.random() * maxNum) + minNum;
}
