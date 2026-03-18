output "ec2_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_instance.halleyx_server.public_ip
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_instance.halleyx_server.public_ip}"
}
