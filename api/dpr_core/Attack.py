from dpr_core.DiceFormula import DiceFormula
from dpr_core.probability_utils import halve_dist, superposition_dists, add_dists


class Attack:

    def __init__(self, name, damagef, toHitf, is_crit=False):
        self.name = name
        self.damage_formula = DiceFormula(damagef)
        self.is_crit = is_crit
        self.raw_damage_avg = self.damage_formula.avg_roll()
        self.raw_damage_dist = self.damage_formula.frequencies()
        if "SAVE" in toHitf:
            self.attackType=toHitf
        else:
            self.attackType="ROLL"
            if not self.is_crit:
                self.hit_dist = DiceFormula(toHitf).frequencies()
            else: # Determine crits
                self.hit_dist = DiceFormula(toHitf).enc_frequencies()
                hit_terms = toHitf.split('+')
                d20 = None
                for term in hit_terms:
                    if '20' in term:
                        d20 = term.strip()
                        break
                self.crit_hit_chance = DiceFormula(d20).frequencies()[20]
                self.crit_hitf = DiceFormula(damagef, is_crit_hit=True)

        # If we make a saving throw,
        #   we assume we hit 50% of the time

    def __str__(self):
        return self.name

    # Return the probability for the attack to hit a given AC
        # This does not include the probability for a critical hit
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
            if self.is_crit:
                result = superposition_dists(result, {key:value*self.crit_hit_chance for key, value in self.crit_hitf.frequencies().items()})
                result[0] = 1 - hit_prob - self.crit_hit_chance
            else:
                result[0] = 1 - hit_prob
        return result

    # Return the average damage of the attack against a given AC
    def damage_avg(self, AC):
        if "HALF" in self.attackType:
            return ( self.raw_damage_avg*self.prob_to_hit(AC) +
                        (self.raw_damage_avg/2)*(1-self.prob_to_hit(AC)) )
        else:
            result = self.raw_damage_avg*self.prob_to_hit(AC)
            if self.is_crit:
                result += self.crit_hit_chance*self.crit_hitf.avg_roll()
            return result