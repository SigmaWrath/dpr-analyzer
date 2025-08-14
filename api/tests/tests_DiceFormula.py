import unittest
from dpr_core.Die import Die
from dpr_core.DiceFormula import DiceFormula

class MyTestCase(unittest.TestCase):

    def test_max_roll(self):
        attack = DiceFormula("Ad20+2d4+5")
        self.assertEqual(20+2*4+5, attack.max_roll())

    def test_avg_roll(self):
        attack = DiceFormula("Ad20+2d4+5")
        self.assertEqual(Die('A20').avg()+2*2.5+5, attack.avg_roll())

    def test_frequencies_1(self):
        damage = DiceFormula("2d4+5")
        theoretical = {7:1/16, 8:2/16, 9:3/16, 10:4/16, 11:3/16, 12:2/16, 13:1/16}
        result = damage.frequencies()
        self.assertAlmostEqual(1, sum(result.values()), delta=0.0001)
        self.assertEqual(theoretical, result)

    def test_graph(self):
        damage = DiceFormula("Ad20+1d4+3")
        damage.graph()

if __name__ == '__main__':
    unittest.main()
