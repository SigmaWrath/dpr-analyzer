import unittest
from dpr_core.Die import Die

class TestDie(unittest.TestCase):

    # Test average die roll
    def test_avg(self):
        d20 = Die(20)
        self.assertEqual(10.5, d20.avg())

    def test_dadv_avg(self):
        Dd20 = Die('D20')
        self.assertEqual(7.175, Dd20.avg())

    def test_adv_avg(self):
        Ad20 = Die('A20')
        self.assertEqual(13.825, Ad20.avg())

    # Test probability distributions of die
    def test_dist(self):
        dist = {1: 1/6, 2: 1/6, 3: 1/6,
                    4: 1/6, 5: 1/6, 6: 1/6}
        d6 = Die(6)
        self.assertEqual(dist, d6.distribution())

    def test_dadv_dist(self):
        dadv_dist = {1: 11/36, 2: 9/36, 3: 7/36,
                    4: 5/36, 5: 3/36, 6: 1/36}
        Dd6 = Die('D6')
        self.assertEqual(dadv_dist, Dd6.distribution())

    def test_adv_dist(self):
        adv_dist = {1: 1/36, 2: 3/36, 3: 5/36,
                    4: 7/36, 5: 9/36, 6: 11/36}
        Ad6 = Die('A6')
        self.assertEqual(adv_dist, Ad6.distribution())


if __name__ == '__main__':
    unittest.main()