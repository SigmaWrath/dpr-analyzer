import unittest
from dpr_core.Die import Die
from dpr_core.probability_utils import add_dists

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

if __name__ == '__main__':
    unittest.main()