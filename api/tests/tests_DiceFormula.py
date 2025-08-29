import unittest

from mypy.binder import defaultdict

from dpr_core.Die import Die
from dpr_core.DiceFormula import DiceFormula
from dpr_core.probability_utils import graph_dist

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

    def test_savage_greatsword(self):
        great_dmg = DiceFormula("2d6")
        probs = great_dmg.frequencies()

        result = defaultdict(int)
        for j in probs.keys():
            for k in probs.keys():
                result[max(j, k)] += probs[j]*probs[k]

        great_avg = 0
        for i in result.keys():
            great_avg += i*result[i]

        print(f"\n2d6 savage avg: {great_avg}")
        d12_savage = Die("A12")
        print(f"1d12 savage avg: {d12_savage.avg()}")

        d12_dif = d12_savage.avg()-Die(12).avg()
        d10_dif = Die("A10").avg()-Die(10).avg()
        d8_dif = Die("A8").avg()-Die(8).avg()
        d6_dif = Die("A6").avg()-Die(6).avg()

        print(f"\n2d6 dif: {great_avg-great_dmg.avg_roll()}")
        print(f"1d12 dif: {d12_dif}")
        print(f"1d10 dif: {d10_dif}")
        print(f"1d8 dif: {d8_dif}")
        print(f"1d6 dif: {d6_dif}")

        graph_dist(frequencies=result, x_label='2d6 Savage')
        graph_dist(d12_savage.distribution(), x_label='1d12 Savage')

if __name__ == '__main__':
    unittest.main()
