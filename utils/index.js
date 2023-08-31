import moment from '@/node_modules/moment';
import CryptoJS from "@/node_modules/crypto-js";

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

// 比较一个时间字符串和当前时间的天数间隔
export function diffTimeStrFromNow(timeStr) {
  // momentObj.diff(comparedMomentObj, 'units');
  // momentObj 是要比较的 Moment 对象，comparedMomentObj 是被比较的 Moment 对象，units 是可选参数，表示时间间隔的单位。
  // 以下是一些常用的时间间隔单位：
  // years-年数、months-月数、weeks-周数、days-天数、hours-小时数、minutes-分钟数、 seconds-秒数、milliseconds-毫秒数
  return moment(timeStr, 'YYYY-MM-DD HH:mm:ss').diff(moment(), 'hours');
}

// 解密函数
export function decryptString(encryptedText, key) {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedText, key);
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedText;
}
