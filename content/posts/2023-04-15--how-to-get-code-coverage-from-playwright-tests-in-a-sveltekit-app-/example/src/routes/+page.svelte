<script lang="ts">
    function increment(n: number) {
        if(n < 10) {
            n++;
        }
        return n;
    }
    $: n = increment(5);
</script>


<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<p>
    This should be six: {n}
</p>
