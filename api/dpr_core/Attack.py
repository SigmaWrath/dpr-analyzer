from dpr_core.DiceFormula import DiceFormula
from dpr_core.probability_utils import halve_dist, superposition_dists


class Attack:

    def __init__(self, name, damagef, toHitf):
        self.name = name
        self.damage_formula = DiceFormula(damagef)
        self.raw_damage_avg = self.damage_formula.avg_roll()
        self.raw_damage_dist = self.damage_formula.frequencies()
        if "SAVE" in toHitf:
            self.attackType=toHitf
        else:
            self.attackType="ROLL"
            self.hit_dist = DiceFormula(toHitf).frequencies()

        # If we make a saving throw,
        #   we assume we hit 50% of the time

    def __str__(self):
        return self.name

    # Return the probability for the attack to hit a given AC
    def prob_to_hit(self, AC):
        if self.attackType=="ROLL":
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
        if "HALF" in self.attackType:
            miss = {key:value*(1-hit_prob) for key, value in self.raw_damage_dist.items()}
            miss = halve_dist(miss)
            result = superposition_dists(result, miss)
        else:
            result[0] = 1 - hit_prob
        return result

    # Return the average damage of the attack against a given AC
    def damage_avg(self, AC):
        if "HALF" in self.attackType:
            return ( self.raw_damage_avg*self.prob_to_hit(AC) +
                        (self.raw_damage_avg/2)*(1-self.prob_to_hit(AC)) )
        else:
            return self.raw_damage_avg*self.prob_to_hit(AC)