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



if __name__ == '__main__':
    unittest.main()
