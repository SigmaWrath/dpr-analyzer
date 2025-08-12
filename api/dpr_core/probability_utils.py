from collections import defaultdict

def add_dists(dist1, dist2):
    result = defaultdict(int)

    # Add a distribution and a constant
    if dist2.__class__.__name__ == 'int':
        for i in dist1.keys():
            result[i+dist2] = dist1[i]
    # Add two distributions
    else:
        for j in dist1.keys():
            for k in dist2.keys():
                result[j+k] += dist1[j]*dist2[k]

    return result
