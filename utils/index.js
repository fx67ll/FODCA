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

// 判断一个数字是否在某个数字数组中至少出现过三次
export function hasNumberAppearedTwiceOrMore(arr, num) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === num) {
      count++;

      if (count >= 3) {
        return true;
      }
    }
  }
  return false;
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
  return backStr1 === backStr2;
}

// 返回中奖信息
export function checkLotteryResult(lotteryType, recordNumStr, winNumStr) {
  const frontNumbers = recordNumStr.split('-')[0].split(',');
  const backNumbers = recordNumStr.split('-')[1].split(',');
  const winningFrontNumbers = winNumStr.split('-')[0].split(',');
  const winningBackNumbers = winNumStr.split('-')[1].split(',');

  console.log(lotteryType, frontNumbers, backNumbers, winningFrontNumbers, winningBackNumbers);

  const result = {
    prizeLevel: 0,
    prizeText: '',
    prizeAmount: 0,
  };

  const frontMatchCount = frontNumbers.filter(num => winningFrontNumbers.includes(num)).length;
  const backMatchCount = backNumbers.filter(num => winningBackNumbers.includes(num)).length;
  const totalMatchCount = frontMatchCount + backMatchCount;

  if (lotteryType === 1) {
    // 一等奖奖金为浮动奖金
    // 二等奖奖金为浮动奖金
    // 三等奖固定奖金10000元
    // 四等奖固定奖金3000元
    // 五等奖固定奖金300元
    // 六等奖固定奖金200元
    // 七等奖固定奖金100元
    // 八等奖固定奖金15元
    // 九等奖固定奖金5元
    switch (totalMatchCount) {
      case 7:
        result.prizeLevel = 1;
        result.prizeText = '一等奖';
        result.prizeAmount = 10000000;
        break;
      case 6:
        if (backMatchCount === 2) {
          result.prizeLevel = 4;
          result.prizeText = '四等奖';
          result.prizeAmount = 3000;
        } else if (backMatchCount === 1) {
          result.prizeLevel = 2;
          result.prizeText = '二等奖';
          result.prizeAmount = 5000000;
        }
        break;
      case 5:
        if (backMatchCount === 2) {
          result.prizeLevel = 6;
          result.prizeText = '六等奖';
          result.prizeAmount = 200;
        } else if (backMatchCount === 1) {
          result.prizeLevel = 5;
          result.prizeText = '五等奖';
          result.prizeAmount = 300;
        } else {
          result.prizeLevel = 5;
          result.prizeText = '三等奖';
          result.prizeAmount = 10000;
        }
        break;
      case 4:
        if (backMatchCount > 0) {
          result.prizeLevel = 8;
          result.prizeText = '八等奖';
          result.prizeAmount = 15;
        } else {
          result.prizeLevel = 7;
          result.prizeText = '七等奖';
          result.prizeAmount = 100;
        }
        break;
      case 3:
        result.prizeLevel = 9;
        result.prizeText = '九等奖';
        result.prizeAmount = 5;
        break;
      case 2:
        if (backMatchCount === 2) {
          result.prizeLevel = 9;
          result.prizeText = '九等奖';
          result.prizeAmount = 5;
        }
        break;
      default:
        result.prizeText = '未中奖';
        break;
    }
  }

  if (lotteryType === 2) {
    // 一等奖奖金为浮动奖金
    // 二等奖奖金为浮动奖金
    // 三等奖固定奖金3000元
    // 四等奖固定奖金200元
    // 五等奖固定奖金10元
    // 六等奖固定奖金5元
    switch (totalMatchCount) {
      case 7:
        result.prizeLevel = 1;
        result.prizeText = '一等奖';
        result.prizeAmount = 5000000;
        break;
      case 6:
        if (backMatchCount === 1) {
          result.prizeLevel = 3;
          result.prizeText = '三等奖';
          result.prizeAmount = 3000;
        } else {
          result.prizeLevel = 2;
          result.prizeText = '二等奖';
          result.prizeAmount = 100000;
        }
        break;
      case 5:
        result.prizeLevel = 4;
        result.prizeText = '四等奖';
        result.prizeAmount = 200;
        break;
      case 4:
        result.prizeLevel = 5;
        result.prizeText = '五等奖';
        result.prizeAmount = 10;
        break;
      case 3:
        if (backMatchCount === 1) {
          result.prizeLevel = 6;
          result.prizeText = '六等奖';
          result.prizeAmount = 5;
        }
        break;
      case 2:
        if (backMatchCount === 1) {
          result.prizeLevel = 6;
          result.prizeText = '六等奖';
          result.prizeAmount = 5;
        }
        break;
      case 1:
        if (backMatchCount === 1) {
          result.prizeLevel = 6;
          result.prizeText = '六等奖';
          result.prizeAmount = 5;
        }
        break;
      default:
        result.prizeText = '未中奖';
        break;
    }
  }

  console.log(result);
  return result;
}
