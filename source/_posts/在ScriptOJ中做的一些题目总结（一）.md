---
title: 在ScriptOJ中做的一些题目总结（一）
date: 2018-01-06 23:25:16
categories:
- front-end
- JS
tags:
- JS
- ScriptOJ
---
最近在网上刷题，发现了一个叫ScriptOJ的网站。挑了上面的几个题目做下来发现还是挺有意思的。对做过的几个题目，做了一下笔记：
<!-- more -->
<br>
1. 斐波那契数列<br>
```
斐波那契数列指的是类似于以下的数列：
1, 1, 2, 3, 5, 8, 13, ....
也就是，第 n 个数由数列的前两个相加而来：f(n) = f(n - 1) + f(n -2)
请你完成 fibonacci 函数，接受 n 作为参数，可以获取数列中第 n 个数，例如：
fibonacci(1) // => 1
fibonacci(2) // => 1
fibonacci(3) // => 2
...
测试程序会从按顺序依次获取斐波那契数列中的数，请注意程序不要超时，也不要添加额外的全局变量。
```
该题有performanced的要求，第一次我写的代码如下：
```javascript
const fibonacci = (n) => {
  let a = 1,
      b = 1;
      tn = n;
  if (n < 3) {
    return 1;
  }
  while (tn > 2) {
    [a, b] = [b, a+b];
    tn--;
  }
  return b;
}
```
提交结果后，发现测试结果超时。思考了一下，发现其实可以采用闭包的形式来回答这个问题。
修改后的代码如下:
```javascript
const fibonacci = ((n) => {
  let memory = [];
  return (n) => {
    if (memory[n] != null) {
      return memory[n];
    }
    return memory[n] = (n === 0 || n === 1)? n: fibonacci(n-1) + fibonacci(n-2);
  }
})()
```
这里需要注意两点。<br>1: 闭包能提升性能的基本思想是**牺牲存储空间**来换取**时间上的性能**。如果不使用闭包，那么memory[]在函数执行完之后空间会被释放，正是使用的闭包的原因，在函数执行后memory[]才会在内存中一直存在。所以在执行过一次fibonacci函数之后，对于小于n的n-1种情况的值都会在memory中存储，当下次计算小于n的fibonacci函数值的时候不需要再递归迭代整个函数，直接读取memory[n]就可以了。<br>2: 由于第一个箭头函数返回的是第二个箭头函数，所以需要将第二个箭头函数再执行一下才能得到想要的数值结果。于是需要用括号将整个函数包起来并立即执行，即(()=>{})()的形式。

2. 原型方法 spacify<br>
```
请你给字符串都添加上原型方法 spacify，可以让一个字符串的每个字母都多出一个空格的间隔：
"ScriptOJ".spacify() // => "S c r i p t O J"
```
对于该题，主要是在String的原型对象上添加spacify()的方法，所以刚开始的代码如下:
```javascript
String.prototype.spacify = () => {
  return String.prototype.split.call(this,"").join(" ");
}
```
但是运行该代码的时候，发现报错“输入 'ScriptOJ'，应该返回 'S c r i p t O J' 而你返回的是 '[ o b j e c t W i n d o w ]'”，采用箭头函数的时候将this绑定在了全局里。后来改代码如下:
```javascript
String.prototype.spacify = function() {
  console.log(this);
  return String.prototype.split.call(this,"").join(" ");
}
```
测试通过。所以虽然箭头函数在表达上比较清楚整洁，但是会绑定this对象，所以在使用箭头函数的时候要格外小心this的绑定。
本题还可以写作如下：
```javascript
String.prototype.spacify = function() {
  return this.split("").join(" ");
}
```
而写成如下方式回报错：
```javascript
String.prototype.spacify = () => {
  return this.split("").join(" ");
}
```
原因也是因为写成箭头函数的形式会绑定window对象，而window没有split的方法，查找window.split为undefined。

3. 按下标插入<br>
```
现在有一个数组存放字符串数据：
['item1', 'item2', 'item3', 'item4', 'item5']
有另外一个数组存放一组对象：
[
  { content: 'section1', index: 0 },
  { content: 'section2', index: 2 }
]
它每个对象表示的是会往原来的数组的 index 坐标插入 content 数据（index 不会重复）：

       0      1      2      3      4
     item1  itme2  item3  item4  item5
    ^             ^ 
    |             |
 section1     section2  

最后结果是：['section1', 'item1', 'item2', 'section2', 'item3', 'item4', 'item5']
请你完成 injectSections 函数，可以达到上述的功能：
injectSections(
  ['item1', 'item2', 'item3', 'item4', 'item5'],
  [
    { content: 'section1', index: 0 },
    { content: 'section2', index: 2 }
  ]
) // => ['section1', 'item1', 'item2', 'section2', 'item3', 'item4', 'item5']
```
看到这道题目的时候，最先的思路是因为插入原数组后，插入位置之后的数组下标会发生变化。所以先考虑将要插入的数组按升序排列。然后从尾部一个一个插入到原数组中去。
代码如下：
```javascript
const injectSections = (items, sections) => {
  function sortNumber(a,b) {
    return a.index-b.index;
  }
  let sectionsSort = sections.sort(sortNumber);
  while (sectionsSort.length) {
    let temp = sectionsSort.pop();
    items.splice(temp.index,0,temp.content)
  }
  return items;
}
```
后来看了对于该题的讨论，发现可以抓住index不会重复这个特点，巧妙的将使用数组嵌套的方法，然后扁平话数组来解决这个问题。经修改后的代码如下:
```javascript
const injectSections = (items, sections) => {
    sections.forEach(
        (v,i)=>{
            items[v.index]=[v.content,items[v.index]]
        }
    );
    return [].concat.apply([],items);
}
```
这样的写法有两个需要注意的地方。<br>(1)forEach方法的callback函数的参数可以有三个`function callbackfn(value, index, array1)`，分别为value，index和array。（2）通过该方法将数组的元素变成一个数组，即两层嵌套。然后通过concat.applay()的方法将这个最多两层嵌套的数组扁平化。这里主要用到了apply这个方法的第二个参数是一个数组这个原理。当然也可以用ES6的`...arr`先将数组的元素分离出来就可以用call的方法通用扁平化这个数组:
```javascript
const injectSections = (items, sections) => {
    sections.forEach(
        (v,i)=>{
            items[v.index]=[v.content,items[v.index]]
        }
    );
    return [].concat.call([],...items);
}
```

4.  判断两个 Set 是否相同 
```
完成 isSameSet 函数，它接受了两个 Set 对象作为参数，请你返回 true/false 来表明这两个 set 的内容是否完全一致，例如：

const a = {}
const b = 1
const c = 'ScriptOJ'

const set1 = new Set([a, b, c])
const set2 = new Set([a, c, b])

isSameSet(set1, set2) // => true
```
对于这题，首先想到的是遍历的方法比较两个set的元素是否一致，代码如下:
```javascript
const isSameSet = (s1, s2) => {
  if (s1.size === s2.size) {
    for (let a of s1) {
      let res = false;
      for (let b of s2) {
        if (a === b) {
          res = true;
        }
      }
      if (!res) {
        return false;
      }
    }
    return true;
  }
  return false;
}
```
后来review代码的时候发现过于复杂，其实根据ES6的自带方法可以很简洁的表示出这个函数，修改后的代码如下:
```javascript
const isSameSet = (s1, s2) => {
  if (s1.size != s2.size) {
    return false;
  }
  return [...s1].every((x)=>s2.has(x));
}
```
主要用到两个新特性，一个是用`...arr`来展开数组。一个是用Set.prototype.has()的方法来查询set是否有这个元素。

5. 数组去重
```
编写一个函数 unique(arr)，返回一个去除数组内重复的元素的数组。例如：

unique([0, 1, 2, 2, 3, 3, 4]) // => [0, 1, 2, 3, 4]
unique([0, 1, '1', '1', 2]) // => [0, 1, '1', 2]
```
该题的思路是首先创建一个空数组，然后根据indexOf()方法来判断是否有某个元素，代码如下:
```javascript
const unique = (arr) => {
  let ret = [];
  for (let i = 0; i < arr.length; i++) {
    if (ret.indexOf(arr[i]) == -1) {
      ret.push(arr[i]);
    }
  }
  return ret;
}
```
当然，讨论组中，也有人利用ES6的Set新特性来数组去重:
```javascript
const unique = (arr) => Array.from(new Set(arr))
```

6. 不用循环生成数组 
```
完成 arrWithoutLoop 函数，它会被传入一个整数 n 作为参数，返回一个长度为 n 的数组，数组中每个元素的值等于它的下标。arrWithoutLoop 中不能使用循环控制结构。
```
这个题目比较有意思，不能用循环。巧妙地用到了ES6中Arrary.prototype.keys()的方法。答案如下:
```javascript
const arrWithoutLoop = (n) => {
  return [...Array(n).keys()];
}
```
还有一道题是传入两个参数m、n，生成一个有m个n的数组。这个就需要用到Arrary.prototype.fill()的方法。
```javascript
const initArray = (m, n) => {
  let ret = [];
  ret.length = m;
  ret.fill(n);
  return ret;
}
```
也可以用new Array()来代替前两行代码，如下:
```javascript
const initArray = (m, n) => {
  let ret = new Array(m);
  ret.fill(n);
  return ret;
}
```

7. 数组拍平
```
编写一个 JavaScript 函数，接受一个仅包含数字的 多维数组 ，返回拍平以后的结果。例如传入：[1, [[2], 3, 4], 5]，返回 [1, 2, 3, 4, 5]。
```
在做题的时候发现一个有趣的地方，可以用Array.prototype.toString()的方法来扁平化数组的每一个元素，输出得到一个以","分开的字符串。于是该题要做的就是再将这个字符串以","为分割点转换成数组。首先考虑到的代码如下:
```javascript
const flatten = (arr) => {
  arr.toString().split(",");
}
```
但是结果报错，忽略了两个地方(1)实际上得到的数组的每个元素都属字符串的形式，需要再转化一下。用parseInt()这个方法。(2)另外一个地方是如果传入的是空数组，这个时候用map()的方法parseInt元素数值时得到的结果是[NaN]，所以要将空数组排除在外。改后的函数输入下:
```javascript
const flatten = (arr) => {
  if (arr.length == 0) {
    return [];
  }
  else {
    return arr.toString().split(",").map((x)=>{return parseInt(x);});
  }
}
```
根据MDN上介绍，toString()也可以用join()的方法。区别是join()方法可以在参数中添加分隔符，而toString()则默认利用了join("")的方法。

8. +1s 程序
```
完成一个生成计数器的函数 plusFor，调用它会返回一个计数器。计数器本身也是一个函数，每次调用会返回一个字符串。
达到以下的效果：
const counter1 = plusFor('小明')
counter1() // => 为小明+1s
counter1() // => 为小明+2s
counter1() // => 为小明+3s
...
const counter2 = plusFor('李梅')
counter2() // => 为李梅+1s
counter2() // => 为李梅+2s
counter2() // => 为李梅+3s
...
注意你只需要完成 plusFor 函数，不要使用额外的全局变量。
```
这题比较简单，利用闭包的方法可以达到不使用全局变量而达到计数的目的。
代码如下:
```javascript
const plusFor = function(s) {
  var cnt = 0;
  return function() {
    cnt++;
    return `为${s}+${cnt}s`;
  }
}
```

9. 函数防抖 debounce
```
在前端开发当中，会遇到某个函数被高频率调用的情况。比如说用户疯狂地按住某个按钮，这些事件都会导致回调函数被高频地调用，但是高频调用这些函数可能会导致页面运行效率下降。
于是就有了一种 debounce 的解决方案：如果你疯狂、高频地调用某个函数，而调用之间的时间间隔低于某个时间段，这个函数最后只会被执行一次；如果高于某个时间段，则会执行多次。
请你完成 debounce，它接受两个参数，一个是被封装函数，一个是时间间隔（ms），然后返回一个函数。可以做到函数防抖的效果：
window.addEventListener('resize', debounce(() => {
  console.log('Hello')
}, 100))
```
这题在实际应用中处理多次重复的请求时很有用，在实际使用的时候，有可能会在同一时间内发生多次同样的请求，那么只需要保证在一段时间内没有新请求的情况下才执行操作即可。而对于setTimeout这个函数来说可以在调用的时候赋值给一个变量，那么这个变量的值就是这个setTimeout()函数的ID，对应的可以用clearTimeout()这个函数来清除setTimeout()的callback函数。代码如下:
```javascript
const debounce = (fn, duration) => {
  var timer = null;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, duration);
  }
}
```
以上代码利用了闭包的概念使得timer这个变量得以不被垃圾回收机制清除。
