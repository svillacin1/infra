FROM grafana/grafana:latest

RUN mkdir -p /var/lib/grafana/dashboards

COPY ./nginx_vts.json /var/lib/grafana/dashboards/

ENV GF_DASHBOARDS_JSON_ENABLED="true"
ENV GF_DASHBOARDS_JSON_PATH="/var/lib/grafana/dashboards"

EXPOSE 3000

CMD ["grafana-server", "--homepath=/usr/share/grafana", "--config=/etc/grafana/grafana.ini"]