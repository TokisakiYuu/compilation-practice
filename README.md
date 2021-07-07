## 清单

### [translator](https://github.com/TokisakiYuu/compilation-practice/tree/main/translator)
**Lisp语法函数调用语句转换为C语言函数调用语句**
```bash
(foo 2 3) 转换成 foo(2, 3)
```
---

### [calculator](https://github.com/TokisakiYuu/compilation-practice/tree/main/calculator)
**四则运算计算器**
```javascript
// 例如这样的式子(只支持0-9的数字)
(2 + 3) - 1 * 2
// => 3
```

---

### [let-lang](https://github.com/TokisakiYuu/compilation-practice/tree/main/let-lang)
**只包含变量声明和打印变量两种特性的简单语言，实现了有限的源码映射、错误提示**
```bash
let-lang> let x = 9;
let-lang> let y = 45;
let-lang> x = z;
x = z;
    ^
    未声明变量 z
let-lang> x = y;
let-lang> print x
45
let-lang>
```