export class CorporationDto {
    corporation_id: number;
    corporation_name: string;
    corporation_ticker: string;
    members: number;
    ships_destroyed: number;

    constructor(
        corporation_id: number,
        corporation_name: string,
        corporation_ticker: string,
        members: number,
        ships_destroyed: number
    ) {
        this.corporation_id = corporation_id;
        this.corporation_name = corporation_name;
        this.corporation_ticker = corporation_ticker;
        this.members = members;
        this.ships_destroyed = ships_destroyed;
    }
}