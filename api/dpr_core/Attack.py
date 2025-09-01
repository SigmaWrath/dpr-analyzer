from dpr_core.DiceFormula import DiceFormula


class Attack:

    def __init__(self, name, damagef, toHitf, isAC=True):
        self.name = name
        self.damage_formula = DiceFormula(damagef)
        self.raw_damage_avg = self.damage_formula.avg_roll()
        self.raw_damage_dist = self.damage_formula.frequencies()
        if isAC:
            self.hit_dist = DiceFormula(toHitf).frequencies()
        self.isAC = isAC
        # If isAC is False, they make a saving throw
        #   ——so we assume we hit 50% of the time

    def __str__(self):
        return self.name

    # Return the probability for the attack to hit a given AC
    def prob_to_hit(self, AC):
        if self.isAC:
            probability = 0
            for roll in self.hit_dist.keys():
                if roll >= AC: # "Equal or exceed" to succeed on a D20 test
                    probability += self.hit_dist[roll]
        else:
            probability = 0.5
        return probability

    # Return the damage distribution of the attack against a given AC
    def damage_dist(self, AC):
        hit_prob = self.prob_to_hit(AC)
        result = {key:value*hit_prob for key, value in self.raw_damage_dist.items()}
        result[0] = 1 - hit_prob
        return result

    # Return the average damage of the attack against a given AC
    def damage_avg(self, AC):
        return self.raw_damage_avg*self.prob_to_hit(AC)