### 清单

- [translator](https://github.com/TokisakiYuu/compilation-practice/tree/main/translator)：
Lisp语法函数调用语句转换为C语言函数调用语句
```lisp
(foo 2 3)
```
转换成
```c
foo(2, 3)
```


- [calculator](https://github.com/TokisakiYuu/compilation-practice/tree/main/calculator)：
四则运算计算器
```javascript
// 例如这样的式子(只支持0-9的数字)
(2 + 3) - 1 * 2
// => 3
```


- [let-lang](https://github.com/TokisakiYuu/compilation-practice/tree/main/let-lang)：
只包含赋值和打印两种特性的简单语言
```javascript
// 例如
let x = 3;
let y;
y = 4;
y = x;
print y;
// => 3
```