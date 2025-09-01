import unittest

from dpr_core.Attack import Attack
from dpr_core.DiceFormula import DiceFormula
from dpr_core.Die import Die
from dpr_core.probability_utils import add_dists, graph_dist, halve_dist


class MyTestCase(unittest.TestCase):

    def test_add_dists_1(self): #TODO: confirm expected value
        d1 = Die(4).distribution()
        d2 = Die(6).distribution()
        result = add_dists(d1, d2)
        print(result)
        self.assertAlmostEqual(1, sum(result.values()), delta=0.0001)

    def test_add_dists_2(self): #TODO: confirm expected value
        d1 = Die(4).distribution()
        d2 = 3
        result = add_dists(d1, d2)
        print(result)
        self.assertAlmostEqual(1, sum(result.values()), delta=0.0001)

    def test_graph_dists(self):
        fireball = DiceFormula("8d6").frequencies()

        graph_dist(fireball, "Fireball Damage, Failed Save")
        graph_dist(halve_dist(fireball), "Fireball Damage, Saved")


if __name__ == '__main__':
    unittest.main()