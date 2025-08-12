import unittest
from dpr_core.Die import Die
from dpr_core.probability_utils import add_dists
from dpr_core.DiceFormula import DiceFormula

class MyTestCase(unittest.TestCase):

    def test_max_roll(self):
        attack = DiceFormula("Ad20+2d4+5")
        self.assertEqual(20+2*4+5, attack.max_roll())

    def test_avg_roll(self):
        attack = DiceFormula("Ad20+2d4+5")
        self.assertEqual(Die('A20').avg()+2*2.5+5, attack.avg_roll())

    def test_add_dists_1(self):
        d1 = Die(4).distribution()
        d2 = Die(6).distribution()
        result = add_dists(d1, d2)
        print(result)
        self.assertAlmostEqual(1, sum(result.values()), delta=0.0001)

    def test_add_dists_2(self):
        d1 = Die(4).distribution()
        d2 = 3
        result = add_dists(d1, d2)
        print(result)
        self.assertAlmostEqual(1, sum(result.values()), delta=0.0001)



if __name__ == '__main__':
    unittest.main()
