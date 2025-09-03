from collections import defaultdict
import matplotlib.pyplot as plt
import math

def add_dists(dist1, dist2):
    result = defaultdict(int)

    # Add a distribution and a constant
    if dist2.__class__.__name__ == 'int':
        return {key + dist2 : value for key, value in dist1.items()}
    # Add two distributions
    else:
        for j in dist1.keys():
            for k in dist2.keys():
                result[j+k] += dist1[j]*dist2[k]

    return result

def graph_dist(frequencies: dict[int:float], x_label: str):
    plt.bar(frequencies.keys(), [i*100 for i in frequencies.values()], color='#1f77b4', edgecolor='black')
    plt.xlabel(x_label)
    plt.ylabel('Percentage (%)')
    plt.title('Statistical Distribution of ' + x_label)
    plt.show()

# For taking have damage on a successful save
def halve_dist(dist: dict[int:float]):
    result = defaultdict(int)
    for i in dist.keys():
        new_key = math.floor(i/2)
        result[new_key] += dist[i]
    return result

def superposition_dists(dist1: dict[int:float], dist2: dict[int:float]):
    result = defaultdict(int)
    set1 = set(dist1.keys())
    set2 = set(dist2.keys())
    possible_rolls = set1.union(set2)
    for roll in possible_rolls:
        if roll in dist1:
            result[roll] += dist1[roll]
        if roll in dist2:
            result[roll] += dist2[roll]
    return result