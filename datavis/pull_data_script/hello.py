import requests

# Your WMATA API key
API_KEY = "b520f5854fb5428d8a4b32f10dcc9528"  # TODO: Move to environment variable


def get_lines():
    url = f"https://api.wmata.com/Rail.svc/json/jLines?api_key={API_KEY}"

    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    lines = []

    for line in data["Lines"]:
        lines.append(
            {
                "lineCode": line["LineCode"],
                "startStationCode": line["StartStationCode"],
                "endStationCode": line["EndStationCode"],
            }
        )
    return lines


def get_stations(line_code):
    url = f"https://api.wmata.com/Rail.svc/json/jStations?LineCode={line_code}&api_key={API_KEY}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    return [
        {
            "code": station["Code"],
            "name": station["Name"],
            "lat": station["Lat"],
            "lon": station["Lon"],
        }
        for station in data["Stations"]
    ]


def get_station_sequence(line_code: str, start_station: str, end_station: str):
    url = f"https://api.wmata.com/Rail.svc/json/jPath?FromStationCode={start_station}&ToStationCode={end_station}&api_key={API_KEY}"

    print(f"Fetching station sequence for line {line_code}...")
    response = requests.get(url)
    response.raise_for_status()

    data = response.json()
    sequence = []

    for station in data["Path"]:
        sequence.append(
            {"code": station["StationCode"], "sequenceNum": station["SeqNum"]}
        )

    print(f"Found {len(sequence)} stations in sequence for line {line_code}")
    return sequence


def main():
    lines = get_lines()
    print(get_stations(lines[0]["lineCode"]))
    # for line in lines:
    #     get_line()
    #     time.sleep(2)


if __name__ == "__main__":
    main()
