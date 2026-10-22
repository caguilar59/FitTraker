const calendarEvent = {
    props: {
        currentDate: String,
        blockInfo: String,
        buttonBlock: String,
        hasProgram: Boolean
    },

    template: `
        <div class="calendar-card">
            <h6>{{ currentDate }}</h6>

            <button
                type="button"
                class="btn btn-sm"
                :class="hasProgram ? 'btn-primary' : 'btn-secondary'"
                :title="hasProgram ? 'Edit Program' : 'Add Program'"
            >
                <i
                    :class="hasProgram
                        ? 'bi bi-pencil-square'
                        : 'bi bi-plus-lg'"
                ></i>
            </button>

            <p>{{ blockInfo }}</p>
        </div>
    `
};

window.calendarEvent = calendarEvent;

new Vue({
    el: '#calendar',

    components: {
        'calendar-event': window.calendarEvent
    },

    data: {
        programs: [],

        calendarDays: Array.from({ length: 7 }, (_, index) => {
            const date = new Date();

            date.setDate(date.getDate() + index);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return {
                dateKey: `${year}-${month}-${day}`,

                currentDate: date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                }),

                blockInfo: 'No Program',
                buttonBlock: 'Add Program'
            };
        })
    },

    async mounted() {
        try {
            const response = await fetch('/api/programs', { cache: 'no-store' });
            if (!response.ok) throw new Error('Unable to load programs');
            this.programs = (await response.json()).programs;
        } catch {
            const message = document.createElement('p');
            message.setAttribute('role', 'status');
            message.textContent = 'Unable to load your schedule. Please refresh to try again.';
            this.$el.appendChild(message);
        }
    },

    methods: {
        hasProgram(dateKey) {
            return this.programs.some(program => {
                return program.date === dateKey;
            });
        }
    }
});
