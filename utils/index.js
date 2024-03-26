import moment from '@/node_modules/moment';
import CryptoJS from '@/node_modules/crypto-js';

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

// 校验两个字符串格式是否一致
function compareStringFormats(str1, str2) {
  const backArr1 = str1.split('-')[1].split(',');
  const backArr2 = str2.split('-')[1].split(',');
  return backArr1.length === backArr2.length;
}

// 校验传参
function validateStr(str1, str2) {
  if (!str1 || !str2) {
    console.error('校验字符串和目标字符串均不能为空！');
    return false;
  }
  // 使用正则表达式匹配两种格式
  const regex = /^(?:\d{1,2}(?:,\d{1,2})*-\d{1,2}(?:,\d{1,2})*)$|^(?:\d{1,2}(?:,\d{1,2})*,\d{1,2}(?:,\d{1,2})*-\d{1,2}(?:,\d{1,2})*)$/;
  if (!regex.test(str1) || !regex.test(str2)) {
    console.error('校验字符串格式错误，请使用 1,4,5,8,10,23-5 或者 4,7,8,10,23-4,9 格式的字符串！');
    return false;
  }
  // 校验两个字符串格式是否一致
  if (!compareStringFormats(str1, str2)) {
    console.error('校验字符串和目标字符串格式不一致！');
    return false;
  }

  return true;
}

// 比较购买的号码和中奖号码有几个数字相同
export function compareStringsBasic(str1, str2) {
  if (!validateStr(str1, str2)) {
    return 0;
  }
  // 对比前半区号码
  const arr1 = str1.split('-')[0].split(',');
  const arr2 = str2.split('-')[0].split(',');
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const intersection1 = new Set([...set1].filter(x => set2.has(x)));
  const count1 = intersection1.size || 0;
  // 对比后半区号码
  const arr3 = str1.split('-')[1].split(',');
  const arr4 = str2.split('-')[1].split(',');
  const set3 = new Set(arr3);
  const set4 = new Set(arr4);
  const intersection2 = new Set([...set3].filter(x => set4.has(x)));
  const count2 = intersection2.size || 0;
  // 返回相同数字
  return count1 + count2;
}

// 判断是否是最低中奖标准
export function compareStringsCheckIsLowestReward(str1, str2) {
  if (!validateStr(str1, str2)) {
    return false;
  }
  // 对比后半区号码
  const backStr1 = str1.split('-')[1];
  const backStr2 = str2.split('-')[1];
  console.log(111, backStr1, backStr2);
  return backStr1 === backStr2;
}
