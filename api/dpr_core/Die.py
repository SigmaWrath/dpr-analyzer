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
            elif self.mode == 'E':
                return (n+1)-(n+1)**2/(4*n)
            else:
                raise Exception("Unexpected Die Mode")

    # Return the probability distribution of a roll of the die
    def distribution(self):
        dist = {}
        n = self.num_sides
        for i in range(n):
            match self.mode:
                case 1:
                    dist[i+1] = 1/n
                case 'A':
                    dist[i+1] = (2*i+1)/(n**2)
                case 'D':
                    dist[i+1] = (2*n-2*i-1)/(n**2)
                case 'E':
                    dist[i+1] = (1+3*i+3*i**2)/n**3
        return dist
