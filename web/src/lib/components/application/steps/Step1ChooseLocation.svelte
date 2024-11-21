<script lang="ts">
	import { ApplicationLocation } from "$lib/model/application";
    import { Button } from "$lib/components/ui/button";
	import { setApplicationLocation } from "$lib/stores/application";

    function setLocation(location: ApplicationLocation) {
        setApplicationLocation(location);
    }
</script>

<div class=" h-full flex flex-wrap justify-center">
    <div class="w-full lg:w-1/2 border-l bg-gradient-to-b from-red-950 to-orange-900 flex items-center justify-center lg:justify-end">
        <div class="w-full flex flex-col items-center justify-evenly p-6 gap-4">
            <div class="flex flex-col items-center text-center text-white">
                <h1 class="text-gradient-dark text-xl sm:text-3xl font-bold">Begin Your Journey in Nullsec</h1>
                <p class="text-red-500 font-bold text-lg">Security status -1.0 to 0.0</p>
            </div>
            <div class="text-center text-white flex flex-col gap-4 lg:h-[270px] xl:h-[200px] 2xl:h-[180px]">
                <p class="lg:h-1/2">Experience what EVE truly has to offer with large scale organizations reliant on players on every level. Miners supplying ore to industrialists, industrialists supplying ships to combat pilots, combat pilots forging & defending borders. Every pilot has a place, every pilot matters & new players are not only welcome, they are needed.</p>
                <p class="lg:h-1/2">You will be joining The Order of Autumn which is part of the nullsec sovereignty holding alliance Black Rose, a member of Phoenix Coalition consisting of 6,000+ pilots. We live out of the nullsec regions of Pure Blind, Fade, & Cloud Ring.</p>
            </div>
            <ul class="w-full flex flex-wrap justify-center text-white">
                <li class="flex flex-col items-center w-1/2 sm:w-1/3">
                    <p class="font-bold text-sm xl:text-base">The Order of Autumn</p>
                    <p>Corporation</p>
                    <img class="w-24 h-24 xl:w-32 xl:h-32 mt-2" src="https://images.evetech.net/corporations/98785281/logo?size=128" alt="The Order of Autumn logo"/>
                </li>
                <li class="flex flex-col items-center w-1/2 sm:w-1/3">
                    <p class="font-bold text-sm xl:text-base">Black Rose</p>
                    <p>Alliance</p>
                    <enhanced:img class="w-24 h-24 xl:w-32 xl:h-32 mt-2" src="/static/blackrose_logo512.png" alt="Black Rose logo"/>
                </li>
                <li class="flex flex-col items-center mt-4 sm:mt-0 w-1/2 sm:w-1/3">
                    <p class="font-bold text-sm xl:text-base">Phoenix Coalition</p>
                    <p>Coalition</p>
                    <enhanced:img class="w-24 h-24 xl:w-32 xl:h-32 mt-2" src="/static/phoenix_logo512.png" alt="Phoenix Coalition logo"/>
                </li>
            </ul>
            <div>
                <Button class="font-bold text-lg p-4 mt-5" variant="outline" on:click={() => setLocation(ApplicationLocation.Nullsec)}>Begin Your Journey in Nullsec</Button>
            </div>
        </div>
    </div>
    <div class="border-color w-full lg:w-1/2 bg-gradient-to-b from-blue-950 to-sky-900 border-l flex items-center justify-center lg:justify-start">
        <div class="w-full flex flex-col items-center justify-evenly p-6 gap-4">
            <div class="flex flex-col items-center text-center text-white">
                <h1 class="text-gradient-dark text-xl sm:text-3xl font-bold">Begin Your Journey in Highsec</h1>
                <p class="text-blue-300 font-bold text-lg">Security status 0.5 to 1.0</p>
            </div>
            <div class="text-center text-white flex flex-col gap-4 lg:h-[270px] xl:h-[200px] 2xl:h-[180px]">
                <p class="lg:h-1/2">For a more laid back experience whether you prefer it to be your EVE experience or if you wish to take more time before joining us in nullsec. Take advantage of all Autumn has to offer to pursue your goals in EVE in a more independent and self-paced environment.</p>
                <p class="lg:h-1/2">You will be joining Autumn Highsec Division out of the Caldari region of Lonetrek where our activity largely centers around the system of Torrinos. While you won't be part of our massive nullsec coalition you'll have full access to Black Rose & Autumn's resources for developing our members.</p>
            </div>
            <ul class="w-full flex justify-center text-white">
                <li class="flex flex-col items-center">
                    <p class="text-sm xl:text-base font-bold text-center">Autumn Highsec Division</p>
                    <p>Corporation</p>
                    <img class="w-24 h-24 xl:w-32 xl:h-32 mt-2" src="https://images.evetech.net/corporations/98784256/logo?size=128" alt="Autumn Highsec Division logo"/>
                </li>
            </ul>
            <div>
                <Button class="font-bold text-lg p-4 mt-5" variant="outline" on:click={() => setLocation(ApplicationLocation.Highsec)}>Begin Your Journey in Highsec</Button>
            </div>
        </div>
    </div>
</div>