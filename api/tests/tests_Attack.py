import unittest

from manim import there_and_back

from dpr_core.Attack import Attack


class MyTestCase(unittest.TestCase):

    def test_average(self):
        scimitar_quarry = Attack("Scimitar w/ Ranger's Quarry",
                                 damagef="1d6+4+1d4", toHitf="1d20+3+4")
        self.assertAlmostEqual(9, scimitar_quarry.damage_avg(10), delta=0.0001)

    def test_dist(self):
        dagger = Attack("Dagger",
                        damagef="1d4+3", toHitf="1d20+3+4")
        experimental = dagger.damage_dist(10)
        theoretical = {4*0.9:0.25, 5*0.9:0.25, 6*0.9:0.25, 7*0.9:0.25}

        theo_keys = list(theoretical.keys())
        theo_values = list(theoretical.values())
        i = 0
        for key in experimental.keys():
            self.assertAlmostEqual(key, theo_keys[i])
            self.assertAlmostEqual(experimental[key], theo_values[i])
            i+=1

if __name__ == '__main__':
    unittest.main()
