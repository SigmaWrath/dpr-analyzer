class Die:
    def __init__(self, num_sides):
        if num_sides.__class__.__name__ != 'int':
            self.mode = num_sides[0]
            self.num_sides = int(num_sides[1:])
        else:
            self.mode = 1
            self.num_sides = num_sides

    def avg(self):
        if self.mode == 1:
            return self.num_sides/2 + 0.5
        else:
            n = self.num_sides
            d_avg = (2*n+1)*(n+1)/(6*n)
            if self.mode == 'D':
                print("Disadvantage")
                return d_avg
            elif self.mode == 'A':
                print("Advantage")
                return (n+1)-d_avg
            else:
                raise Exception("Unexpected Die Mode")



