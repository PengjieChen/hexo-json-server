---
title: 从__proto__，prototype和constructor的区别说起
date: 2017-12-31 23:53:05
tags:
---
刚开始接触对象时，对于对象的prototype和constructor，以及`__proto__`的概念很难形成一个具体的概念，比较抽象。但是慢慢的各种参考文档看得多了之后，对于这个概念就慢慢的有了一个比较全面的认识。<br>
首先，从一段简单代码出发:
```javascript
function FOO() {
};
var foo = new FOO();
```
在上面的代码中，有一个空函数FOO，利用这个空函数构造出foo。那么，这两者的关系就如下图所示:<br>
![](http://p1vvzwyer.bkt.clouddn.com/prototype1.png)<br>
首先在声明FOO函数的时候会有一个默认的prototype属性指向一个对象FOO.prototype，而该对象也会有一个相应的属性(constructor)指回FOO这个函数。新建的foo对象则有一个`__proto__`属性指向FOO.prototype。这里要注意在调用`new FOO()`的时候会执行一遍`FOO`这个函数。<br>
FOO.prototype是FOO的显示原型，`__proto__`是FOO的隐式原型。其中`__proto__`在大多浏览器中支持访问，该属性也写做`[[Prototype]]`，可以通过几个方法来取得两者的对应关系:(1)isPrototypeOf();(2)Object.getPrototypeOf()。
如下图:<br>
![](http://p1vvzwyer.bkt.clouddn.com/prototype2.png)<br>
![](http://p1vvzwyer.bkt.clouddn.com/prototype3.png)<br>
第二张图中红框所示的即在firefox中所展示的`FOO.prototype`的属性。其中可以注意到，对于`FOO.prototype`除了有`constructor`以外，自己也有一个`__proto__`属性。这就要涉及到整个原型链的概念。显示原型用来继承和属性共享，隐式原型则构成原型链，也实现原型的继承。将FOO函数以及相关的函数以及原型在整条原型链上展示出来的结构图如下所示:<br>
![](http://p1vvzwyer.bkt.clouddn.com/prototype4.jpg)<br>
该图借用了知乎的贴图，很好的展示了整条原型链的构成。
基于这个原型链，有一段有趣的代码展示了原型链的功能:
```javascript
function FOO() {    
};
FOO.prototype.constructor === FOO; // true
var foo = new FOO();
foo.constructor === FOO; // true!
```
从这段代码来看似乎foo中有一个constructor的属性指向FOO，但是通过观察foo的属性其实不存在这个constructor:<br>
![](http://p1vvzwyer.bkt.clouddn.com/prototype4.png)<br>
其实这个属性是根据原型链的方向一层一层往上找这个属性的，所以这个foo.constructor其实就是FOO.prototype.constructor所指向的对象。这也是原型链工作的基本原理，在我看来有点类似于c语言中单链表的结构。<br>
还有一点要注意的是在用new来调用构造函数是其步骤有如下几点:
1. 构造一个全新的对象。
2. 这个新对象会被执行`__proto__`连接（指向FOO.prototype）。
3. 这个对象会被绑定到函数调用的this（FOO函数中的this被绑定）。
4. 如果函数没有返回其他对象，那么new表达式会自动返回这个新对象（赋值给foo对象）。