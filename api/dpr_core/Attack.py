from numpy.ma.testutils import assert_almost_equal

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

        ### TEST. This is an assertion that must always be true, but is costly.
        # Delete after some time verifying that it doesn't throw an error.
        exp_avg = 0
        for roll in self.raw_damage_dist:
            exp_avg += roll*self.raw_damage_dist[roll]
        assert_almost_equal(exp_avg, self.raw_damage_avg, decimal=4,
                            err_msg="Damage formula averages don't match. Issue with DiceFormula class.")

    def __str__(self):
        return self.name

    def prob_to_hit(self, AC):
        if self.isAC:
            probability = 0
            for roll in self.hit_dist.keys():
                if roll >= AC: # "Equal or exceed" to succeed on a D20 test
                    probability += self.hit_dist[roll]
        else:
            probability = 0.5
        return probability

    def damage_dist(self, AC):
        hit_prob = self.prob_to_hit(AC)
        result = {key:value*hit_prob for key, value in self.raw_damage_dist.items()}
        result[0] = 1 - hit_prob
        return result

    def damage_avg(self, AC):
        return self.raw_damage_avg*self.prob_to_hit(AC)