Exp => AddExp

AddExp => MulExp
        | MulExp + AddExp
        | MulExp - AddExp

MulExp => Atom
        | Atom * MulExp
        | Atom / MulExp

Atom => num
      | (Exp)

优先级从低到高