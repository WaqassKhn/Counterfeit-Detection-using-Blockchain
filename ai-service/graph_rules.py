VALID_FLOW = {
    "Manufacturer": {"Logistics"},
    "Logistics": {"Distributor"},
    "Distributor": {"Retailer"},
    "Retailer": set(),
}


def analyze_flow(history):
    findings = []

    for index in range(1, len(history)):
        previous = history[index - 1]
        current = history[index]
        allowed_next = VALID_FLOW.get(previous["role"], set())

        if current["role"] not in allowed_next:
            findings.append(
                {
                    "type": "invalid_transition",
                    "detail": f'{previous["role"]} -> {current["role"]} is outside the approved Atlas path'
                }
            )

    return findings

