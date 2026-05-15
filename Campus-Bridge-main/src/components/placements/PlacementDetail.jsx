import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const resultLabels = {
  selected: { label: 'Selected', icon: CheckCircle, color: 'text-chart-3' },
  not_selected: { label: 'Not Selected', icon: XCircle, color: 'text-destructive' },
  waitlisted: { label: 'Waitlisted', icon: Clock, color: 'text-chart-4' },
};

export default function PlacementDetail({ experience: exp, onBack }) {
  const result = resultLabels[exp.result] || resultLabels.selected;
  const ResultIcon = result.icon;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-1.5 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <h1 className="text-2xl font-bold">{exp.company_name}</h1>
              </div>
              <p className="text-lg text-muted-foreground">{exp.role_title}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge className={`gap-1 ${result.color}`} variant="outline">
                  <ResultIcon className="w-3 h-3" /> {result.label}
                </Badge>
                {exp.package_lpa && <Badge variant="secondary">{exp.package_lpa}</Badge>}
                {exp.difficulty && <Badge variant="outline" className="capitalize">{exp.difficulty}</Badge>}
                {exp.batch && <Badge variant="outline">Batch: {exp.batch}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                by {exp.is_anonymous ? 'Anonymous' : exp.author_name} · {exp.created_date && format(new Date(exp.created_date), 'MMM d, yyyy')}
              </p>
            </div>

            {exp.preparation_strategy && (
              <div>
                <h3 className="font-semibold mb-2">Preparation Strategy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{exp.preparation_strategy}</p>
              </div>
            )}

            {exp.interview_rounds?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Interview Rounds</h3>
                <div className="space-y-3">
                  {exp.interview_rounds.map((round, i) => (
                    <Card key={i} className="bg-muted/50">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-1">{round.round_name || `Round ${i + 1}`}</h4>
                        {round.description && <p className="text-sm text-muted-foreground mb-2">{round.description}</p>}
                        {round.questions && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Questions:</p>
                            <p className="text-sm whitespace-pre-wrap">{round.questions}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {exp.tips && (
              <div>
                <h3 className="font-semibold mb-2">Tips & Advice</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{exp.tips}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}