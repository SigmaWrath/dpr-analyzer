class Die:

    def __init__(self, num_sides):
        if num_sides.__class__.__name__ != 'int':
            self.mode = num_sides[0]
            self.num_sides = int(num_sides[1:])
        else:
            self.mode = 1
            self.num_sides = num_sides

    # Return average roll of the die
    def avg(self):
        if self.mode == 1:
            return self.num_sides/2 + 0.5
        else:
            n = self.num_sides
            d_avg = (2*n+1)*(n+1)/(6*n)
            if self.mode == 'D':
                return d_avg
            elif self.mode == 'A':
                return (n+1)-d_avg
            else:
                raise Exception("Unexpected Die Mode")

    # Return the probability distribution of a roll of the die
    def distribution(self):
        dist = {}
        for i in range(self.num_sides):
            match self.mode:
                case 1:
                    dist[i+1] = 1/self.num_sides
                case 'A':
                    dist[i+1] = (2*i+1)/(self.num_sides**2)
                case 'D':
                    dist[i+1] = (2*self.num_sides-2*i-1)/(self.num_sides**2)
        return dist
