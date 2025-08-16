import re
from collections import defaultdict
import matplotlib.pyplot as plt
from .Die import Die
from .probability_utils import add_dists


class DiceFormula:

    def __init__(self, formula):
        self.formula = formula

        dice_dict = defaultdict(int)
        constant = 0
        terms = re.split('\+', self.formula)
        for term in terms:

            # Create a dictionary of {dice:num_rolls}
            if 'd' in term:
                coefficients = re.split('d', term.strip())
                if coefficients[0] == '':
                    dice_dict[int(coefficients[1])] += 1
                elif coefficients[0] == 'A' or coefficients[0] == 'D':
                    dice_dict[coefficients[0] + coefficients[1]] += 1
                else:
                    dice_dict[int(coefficients[1])] += int(coefficients[0])

            # Add up all the constant terms
            else:
                constant += int(term.strip())

        self.dice_dict = dice_dict
        self.constant = constant

    # Return the maximum value of the dice formula
    def max_roll(self):
        max_result = 0

        # Sum up the max rolls of each die
        for die in self.dice_dict.keys():
            # Account for dice with adv or dadv
            if die.__class__.__name__ != 'int':
                max_result += int(die[1:])*self.dice_dict[die]
            else:
                max_result += die*self.dice_dict[die]

        return max_result+self.constant

    # Return the average value of the dice formula
    def avg_roll(self):
        avg_result = 0

        # Sum up the average rolls of each die
        for die in self.dice_dict.keys():
            avg_result += Die(die).avg()*self.dice_dict[die]

        return avg_result+self.constant

    # Return the probability distribution for the results of dice formula
    def frequencies(self):
        # Handle the case for no dice in the formula
        if len(self.dice_dict)==0:
            return {self.constant:1.0}

        # Flatten out the dice dict into an array
        dice = []
        for die in self.dice_dict.keys():
            for i in range(self.dice_dict[die]):
                dice.append(die)

        # Add all the dice distributions together
        result = Die(dice[0]).distribution()
        for i in range(len(dice)-1):
            result = add_dists(result, Die(dice[i+1]).distribution())

        # Add the constant to the distribution and return the result
        return add_dists(result, self.constant)

    # Graph the probability distribution of the dice formula
    def graph(self, color='#1f77b4'):
        frequencies = self.frequencies()
        plt.bar(frequencies.keys(), [i*100 for i in frequencies.values()], color=color, edgecolor='black')
        plt.xlabel(self.formula)
        plt.ylabel('Percentage (%)')
        plt.title('Statistical Distribution of ' + self.formula)
        plt.show()