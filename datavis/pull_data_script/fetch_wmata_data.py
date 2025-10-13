#!/usr/bin/env python3
"""
WMATA Data Fetcher
Fetches all metro lines, stations, and station sequences from WMATA API
and saves them to a JSON file for offline development use.
"""

import json
import math
import time
from typing import Any, Dict, List

import requests

# Your WMATA API key
API_KEY = "b520f5854fb5428d8a4b32f10dcc9528"  # TODO: Move to environment variable


def fetch_lines() -> List[Dict[str, str]]:
    """Fetch all metro lines from WMATA API."""
    url = f"https://api.wmata.com/Rail.svc/json/jLines?api_key={API_KEY}"

    print("Fetching metro lines...")
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

    print(f"Found {len(lines)} metro lines")
    return lines


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the Haversine distance between two points on Earth."""
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))

    # Radius of earth in kilometers
    r = 6371
    return c * r


def sequence_stations_by_proximity(
    stations: List[Dict[str, Any]], start_code: str, end_code: str
) -> List[Dict[str, Any]]:
    """
    Sequence stations by finding the nearest neighbor from start to end.

    Args:
        stations: List of station dictionaries with 'code', 'lat', 'lon'
        start_code: Station code to start from
        end_code: Station code to end at

    Returns:
        List of stations ordered from start to end
    """
    # Find start and end stations
    start_station = next((s for s in stations if s["code"] == start_code), None)
    end_station = next((s for s in stations if s["code"] == end_code), None)

    if not start_station or not end_station:
        print(
            f"Warning: Could not find start ({start_code}) or end ({end_code}) station"
        )
        return stations  # Return original order if we can't find start/end

    # Create a copy of stations to work with
    remaining_stations = [
        s for s in stations if s["code"] not in [start_code, end_code]
    ]
    ordered_stations = [start_station]
    current_station = start_station

    # Keep adding the nearest unvisited station until we reach the end
    while remaining_stations:
        current_lat = current_station["lat"]
        current_lon = current_station["lon"]

        # Find the nearest remaining station
        nearest_station = None
        min_distance = float("inf")

        for station in remaining_stations:
            distance = calculate_distance(
                current_lat, current_lon, station["lat"], station["lon"]
            )
            if distance < min_distance:
                min_distance = distance
                nearest_station = station

        if nearest_station:
            ordered_stations.append(nearest_station)
            remaining_stations.remove(nearest_station)
            current_station = nearest_station

    # Add the end station
    ordered_stations.append(end_station)

    print(f"Sequenced {len(ordered_stations)} stations from {start_code} to {end_code}")
    return ordered_stations


def fetch_stations(line_code: str) -> List[Dict[str, Any]]:
    """Fetch all stations for a specific line."""
    url = f"https://api.wmata.com/Rail.svc/json/jStations?LineCode={line_code}&api_key={API_KEY}"

    print(f"Fetching stations for line {line_code}...")
    response = requests.get(url)
    response.raise_for_status()

    data = response.json()
    stations = []

    for station in data["Stations"]:
        stations.append(
            {
                "code": station["Code"],
                "name": station["Name"],
                "lat": station["Lat"],
                "lon": station["Lon"],
            }
        )

    print(f"Found {len(stations)} stations for line {line_code}")
    return stations


def process_line_data(line_info: Dict[str, str]) -> Dict[str, Any]:
    """Process all data for a single metro line."""
    line_code = line_info["lineCode"]
    start_station = line_info["startStationCode"]
    end_station = line_info["endStationCode"]

    print(f"\n--- Processing Line {line_code} ---")

    # Fetch stations for this line
    stations = fetch_stations(line_code)

    # Sequence stations correctly from start to end using proximity
    ordered_stations = sequence_stations_by_proximity(
        stations, start_station, end_station
    )

    return {
        "lineCode": line_code,
        "startStationCode": start_station,
        "endStationCode": end_station,
        "stations": ordered_stations,
    }


def main():
    """Main function to fetch all WMATA data and save to JSON."""
    print("WMATA Data Fetcher Starting...")
    print("=" * 50)

    try:
        # Fetch all metro lines
        lines_info = fetch_lines()

        # Process each line
        all_lines_data = {}

        for i, line_info in enumerate(lines_info):
            line_data = process_line_data(line_info)
            all_lines_data[line_info["lineCode"]] = line_data

            # Add a small delay to be respectful to the API
            if i < len(lines_info) - 1:  # Don't delay after the last request
                print("Waiting 1 second before next request...")
                time.sleep(1)

        # Save to JSON file
        output_file = "wmata_data.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_lines_data, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Successfully saved WMATA data to {output_file}")
        print(f"📊 Total lines processed: {len(all_lines_data)}")

        # Print summary
        total_stations = sum(len(line["stations"]) for line in all_lines_data.values())
        print(f"📍 Total stations: {total_stations}")

        print("\nLines summary:")
        for line_code, line_data in all_lines_data.items():
            print(f"  {line_code}: {len(line_data['stations'])} stations")

    except requests.exceptions.RequestException as e:
        print(f"❌ API request failed: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()
