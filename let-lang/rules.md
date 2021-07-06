```
Expression => Print
            | Assignment

Print      => "print" name

Assignment => Declare
            | Declare "=" num
            | name    "=" num
            | name    "=" name

Declare    => "let" name
```

优先级从低到高