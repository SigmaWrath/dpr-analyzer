import unittest
from dpr_core.Die import Die

class TestDie(unittest.TestCase):

    def test_avg(self):
        d20 = Die(20)
        self.assertEqual(10.5, d20.avg())

    def test_dadv_avg(self):
        Dd20 = Die('D20')
        self.assertEqual(7.175, Dd20.avg())

    def test_adv_avg(self):
        Ad20 = Die('A20')
        self.assertEqual(13.825, Ad20.avg())




if __name__ == '__main__':
    unittest.main()