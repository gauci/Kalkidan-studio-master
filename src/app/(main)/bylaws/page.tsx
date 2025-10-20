
export default function BylawsPage() {
  return (
    <div className="bg-pattern">
      <div className="container mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Bylaws and Regulations
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            The official rules governing Kalkidan e.V.
          </p>
        </div>

        <article className="mt-12 prose prose-lg max-w-none text-foreground prose-h2:text-destructive prose-h2:font-headline prose-h3:text-destructive prose-h3:font-headline prose-a:text-accent hover:prose-a:text-accent/80">
          <section>
            <h2>Article 1: Name and Purpose</h2>
            <p>
              The name of the association is Kalkidan e.V. It is a non-profit
              organization registered in Munich, Germany. The primary purpose of
              the association is to provide mutual aid and support to its members,
              particularly in times of bereavement, in accordance with Ethiopian
              Edir traditions.
            </p>
          </section>

          <section>
            <h2>Article 2: Membership</h2>
            <h3>2.1 Eligibility</h3>
            <p>
              Membership is open to any person of Ethiopian origin or connection
              residing in Munich and the surrounding areas who agrees to abide by
              the association's bylaws.
            </p>
            <h3>2.2 Application</h3>
            <p>
              Prospective members must submit a completed application form.
              Membership is granted upon approval by the administrative committee
              and payment of the initial registration fee.
            </p>
            <h3>2.3 Termination</h3>
            <p>
              Membership may be terminated by voluntary withdrawal, failure to pay
              monthly contributions for three consecutive months, or by a majority
              vote of the committee for conduct deemed detrimental to the
              association.
            </p>
          </section>
          
          <section>
            <h2>Article 3: Contributions</h2>
            <p>
              All members are required to make a monthly contribution, the amount
              of which is determined by the general assembly. These funds are used
              to provide financial support to member families in the event of a death
              and to cover administrative costs.
            </p>
          </section>

          <section>
            <h2>Article 4: Member Support</h2>
            <p>
              In the event of the death of a member or a member's immediate family
              (spouse, child, parent), the association will provide a fixed sum of
              financial support. Members are also expected to provide comfort and
              assistance to the bereaved family.
            </p>
          </section>

           <section>
            <h2>Article 5: Governance</h2>
            <p>
              The association is governed by an administrative committee elected by
              the general assembly of members. The committee is responsible for
              managing the day-to-day affairs of the Edir, including finances,
              member registration, and organizing meetings.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
