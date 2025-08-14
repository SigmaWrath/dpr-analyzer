from .DiceFormula import DiceFormula
from .probability_utils import add_dists
import matplotlib.pyplot as plt


class Analyzer:

    def __init__(self, name):
        self.attacks = {}
        self.name = name
        self.damage_dists_AC = {}
        self.damage_avgs_AC = {}

    def add(self, attack, times):
        if times>0:
            if attack in self.attacks:
                self.attacks[attack] += times
            else:
                self.attacks[attack] = times

    def max_damage(self):
        damage = 0
        for attack in self.attacks.keys():
            damage += attack.damage_formula.max_roll() * self.attacks[attack]
        return damage

    def simulate(self, AC):
        prob_dists = []

        for attack in self.attacks.keys():
            # Step 1: Compute scaled damage distributions for each attack
            attack_dist = attack.damage_dist(AC)
            # Step 2: Flatten out dictionary into an array of these dists
            for _ in range(self.attacks[attack]):
                prob_dists.append(attack_dist)

        # Step 3: Combine the scaled damage distributions from the array
        result = prob_dists[0]
        for i in range(len(prob_dists)-1):
            result = add_dists(result, prob_dists[i+1])

        # Bonus: Add the damage distribution to the class dictionary of {AC:damage_dist}
        if AC not in self.damage_dists_AC.keys():
            self.damage_dists_AC[AC] = result

        return result

    def compute_avg(self, AC):
        avg_damage = 0
        for attack in self.attacks.keys():
            attack_avg = attack.damage_avg(AC)
            avg_damage += attack_avg*self.attacks[attack]

        if AC not in self.damage_avgs_AC.keys():
            self.damage_avgs_AC[AC] = avg_damage

        return avg_damage

    def graph_cross_section(self, AC, color='#1f77b4'):
        if AC in self.damage_dists_AC.keys():
            probabilities = self.damage_dists_AC[AC]
        else:
            probabilities = self.simulate(AC)
        plt.bar(probabilities.keys(), [x * 100 for x in probabilities.values()],
                color=color, edgecolor='black')
        plt.xlabel('Damage')
        plt.ylabel('Percentage (%)')
        plt.title('Damage Distribution at AC ' + str(AC) + ' for \'' + self.name + '\'')
        plt.show()

    def analyze(self, minAC, maxAC, graphs=False, testAC=15, showMisses=True):
        print("\n\n============================ANALYSIS BELOW======================================")
        print("Max damage: " + str(self.max_damage()))
        AC_range = range(minAC, maxAC+1)
        for AC in AC_range:
            if AC in self.damage_avgs_AC.keys():
                avg = self.damage_avgs_AC[AC]
            else:
                avg = self.compute_avg(AC)
                self.damage_avgs_AC[AC] = avg
            print("AC " + str(AC) + ": " + str(round(avg, 1)))

        #TODO: finish graph methods and add to this mega-method

